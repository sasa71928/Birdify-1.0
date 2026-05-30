import { supabase } from '../lib/supabase';

export type ConversationRole = 'admin' | 'member';

export interface ConversationMember {
  conversation_id: string;
  user_id: string;
  joined_at?: string;
  role?: ConversationRole;
  users?: {
    id: string;
    username: string;
    fullname: string | null;
    profile_pic_url: string | null;
  };
}

export interface Conversation {
  id: string;
  name: string | null;
  description: string | null;
  avatar_url: string | null;
  is_group: boolean;
  created_by: string | null;
  created_at?: string;
  members?: ConversationMember[];
}

export interface ConversationListItem {
  conversation: Conversation;
  lastMessage?: {
    content: string | null;
    image_url: string | null;
    created_at?: string;
    sender_id: string;
    sender?: {
      username: string;
      fullname: string | null;
    };
  };
  unread?: number;
}

export const ConversationRepository = {
  async listForUser(userId: string, page = 0, limit = 30): Promise<ConversationListItem[]> {
    const from = page * limit;
    const to = from + limit - 1;

    // Fetch membership + conversation + members
    const { data, error } = await supabase
      .from('conversation_members')
      .select(
        `
        conversation:conversations (
          id,
          name,
          description,
          avatar_url,
          is_group,
          created_by,
          created_at,
          members:conversation_members (
            conversation_id,
            user_id,
            joined_at,
            role,
            users (id, username, fullname, profile_pic_url)
          )
        )
      `
      )
      .eq('user_id', userId)
      .range(from, to);

    if (error) throw error;

    const conversations: Conversation[] = (data || [])
      .map((row: any) => row.conversation)
      .filter(Boolean);

    if (conversations.length === 0) return [];

    // Filter blocked users: exclude 1:1 chats where the other user is blocked either direction
    const { data: blockedData, error: blockError } = await supabase
      .from('user_blocks')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

    if (blockError) throw blockError;
    const excludedUserIds = new Set(
      (blockedData || []).map((b: any) => (b.blocker_id === userId ? b.blocked_id : b.blocker_id))
    );

    const filteredConversations = conversations.filter((c) => {
      if (c.is_group) return true;
      const other = c.members?.find((m) => m.user_id !== userId)?.user_id;
      if (!other) return true;
      return !excludedUserIds.has(other);
    });

    const conversationIds = filteredConversations.map((c) => c.id);

    // Fetch last messages (best-effort)
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('conversation_id, sender_id, content, image_url, created_at, sender:users (username, fullname)')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false });

    if (msgError) throw msgError;

    const lastByConversation = new Map<string, any>();
    for (const m of messages || []) {
      if (!lastByConversation.has(m.conversation_id)) {
        lastByConversation.set(m.conversation_id, m);
      }
    }

    const results = await Promise.all(
      filteredConversations.map(async (conversation) => {
        const unreadCount = await this.getUnreadCount(conversation.id, userId);
        return {
          conversation,
          lastMessage: lastByConversation.get(conversation.id),
          unread: unreadCount,
        };
      })
    );

    return results;
  },

  async createDirectConversation(currentUserId: string, otherUserId: string): Promise<string> {
    // Try to find existing direct conversation for the two users
    const { data: memberships, error: memError } = await supabase
      .from('conversation_members')
      .select('conversation_id, conversation:conversations (id, is_group)')
      .eq('user_id', currentUserId);

    if (memError) throw memError;

    const directIds = (memberships || [])
      .filter((m: any) => m.conversation?.is_group === false)
      .map((m: any) => m.conversation_id);

    if (directIds.length > 0) {
      const { data: otherMemberships, error: otherError } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', otherUserId)
        .in('conversation_id', directIds);

      if (otherError) throw otherError;
      const existing = otherMemberships?.[0]?.conversation_id;
      if (existing) return existing;
    }

    // Create conversation
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({
        name: null,
        description: null,
        avatar_url: null,
        is_group: false,
        created_by: currentUserId,
      })
      .select('id')
      .single();

    if (convError) throw convError;

    const conversationId = conv.id as string;

    const { error: memberError } = await supabase.from('conversation_members').insert([
      { conversation_id: conversationId, user_id: currentUserId, role: 'admin' },
      { conversation_id: conversationId, user_id: otherUserId, role: 'member' },
    ]);

    if (memberError) throw memberError;
    return conversationId;
  },

  async createGroupConversation(params: {
    creatorId: string;
    name: string;
    description?: string;
    avatarUrl?: string | null;
    memberIds: string[];
  }): Promise<string> {
    const { creatorId, name, description, avatarUrl, memberIds } = params;

    // Upload avatar to Supabase Storage if provided
    let finalAvatarUrl = avatarUrl || null;
    if (avatarUrl && avatarUrl.startsWith('file://')) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) {
          console.error('User not authenticated');
          throw new Error('User not authenticated');
        }
        const fileName = `${user.id}/${Date.now()}.jpg`;
        console.log('Uploading group avatar with fileName:', fileName);
        console.log('User ID:', user.id);
        
        // Use FormData for React Native compatibility
        const formData = new FormData();
        formData.append('file', {
          uri: avatarUrl,
          type: 'image/jpeg',
          name: fileName,
        } as any);

        // Upload using FormData
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('group-avatars')
          .upload(fileName, formData, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error('Error uploading group avatar:', uploadError);
          console.error('Make sure the "group-avatars" bucket exists in Supabase Storage');
          // Continue without avatar if upload fails
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('group-avatars')
            .getPublicUrl(fileName);
          finalAvatarUrl = publicUrl;
          console.log('Group avatar uploaded successfully:', publicUrl);
          console.log('File name used:', fileName);
          console.log('Final avatar URL to save:', finalAvatarUrl);
        }
      } catch (error) {
        console.error('Error processing group avatar:', error);
        // Continue without avatar if processing fails
      }
    }

    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({
        name,
        description: description || null,
        avatar_url: finalAvatarUrl,
        is_group: true,
        created_by: creatorId,
      })
      .select('id, avatar_url')
      .single();

    if (convError) throw convError;
    console.log('Conversation created with avatar_url:', conv.avatar_url);
    const conversationId = conv.id as string;

    const uniqueMemberIds = Array.from(new Set([creatorId, ...memberIds]));
    const rows = uniqueMemberIds.map((id) => ({
      conversation_id: conversationId,
      user_id: id,
      role: id === creatorId ? 'admin' : 'member',
    }));

    const { error: memberError } = await supabase.from('conversation_members').insert(rows);
    if (memberError) throw memberError;

    return conversationId;
  },

  async updateConversation(
    conversationId: string,
    payload: Partial<Pick<Conversation, 'name' | 'description' | 'avatar_url'>>
  ): Promise<void> {
    const { error } = await supabase.from('conversations').update(payload).eq('id', conversationId);
    if (error) throw error;
  },

  async leaveConversation(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('conversation_members')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async deleteConversation(conversationId: string): Promise<void> {
    // Delete all messages in the conversation
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);
    if (messagesError) throw messagesError;

    // Delete all members in the conversation
    const { error: membersError } = await supabase
      .from('conversation_members')
      .delete()
      .eq('conversation_id', conversationId);
    if (membersError) throw membersError;

    // Delete the conversation
    const { error: conversationError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
    if (conversationError) throw conversationError;
  },

  async getById(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        members:conversation_members (
          user_id,
          users (id, username, fullname, profile_pic_url)
        )
      `)
      .eq('id', conversationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Conversation;
  },

  async getConversationMembers(conversationId: string): Promise<ConversationMember[]> {
    const { data, error } = await supabase
      .from('conversation_members')
      .select(`
        *,
        users (id, username, fullname, profile_pic_url)
      `)
      .eq('conversation_id', conversationId);

    if (error) throw error;
    return data as ConversationMember[];
  },

  async addConversationMembers(conversationId: string, userIds: string[]): Promise<void> {
    const rows = userIds.map((userId) => ({
      conversation_id: conversationId,
      user_id: userId,
      role: 'member',
    }));

    const { error } = await supabase.from('conversation_members').insert(rows);
    if (error) throw error;
  },

  async removeConversationMembers(conversationId: string, userIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('conversation_members')
      .delete()
      .eq('conversation_id', conversationId)
      .in('user_id', userIds);
    if (error) throw error;
  },

  // ── conversation_member_states (último mensaje leído) ──
  async getLastReadMessageId(conversationId: string, userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('conversation_member_states')
      .select('last_read_message_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.last_read_message_id ?? null;
  },

  async upsertLastReadMessageId(conversationId: string, userId: string, messageId: string): Promise<void> {
    console.log('[ConversationRepository] upsertLastReadMessageId:', { conversationId, userId, messageId });
    const { error } = await supabase
      .from('conversation_member_states')
      .upsert({
        conversation_id: conversationId,
        user_id: userId,
        last_read_message_id: messageId,
        last_read_at: new Date().toISOString(),
      }, { onConflict: 'conversation_id, user_id' });

    if (error) {
      console.error('[ConversationRepository] upsertLastReadMessageId error:', error);
      throw error;
    }
    console.log('[ConversationRepository] upsertLastReadMessageId success');
  },

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const { data: stateData, error: stateError } = await supabase
      .from('conversation_member_states')
      .select('last_read_message_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (stateError) throw stateError;

    const lastReadId = stateData?.last_read_message_id;

    if (!lastReadId) {
      // No hay mensaje leído: contar todos los mensajes que no son míos
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId);

      if (error) throw error;
      return count || 0;
    }

    // Traer created_at del último mensaje leído
    const { data: lastReadMsg } = await supabase
      .from('messages')
      .select('created_at')
      .eq('id', lastReadId)
      .maybeSingle();

    if (!lastReadMsg) {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId);

      if (error) throw error;
      return count || 0;
    }

    // Contar mensajes no míos después del último leído
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .gt('created_at', lastReadMsg.created_at);

    if (error) throw error;
    return count || 0;
  },

  // ── Posición visible del scroll ──
  async getVisibleMessageId(conversationId: string, userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('conversation_member_states')
      .select('visible_message_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.visible_message_id ?? null;
  },

  async upsertVisibleMessage(conversationId: string, userId: string, messageId: string): Promise<void> {
    const { data: msgData } = await supabase
      .from('messages')
      .select('created_at')
      .eq('id', messageId)
      .single();

    const { error } = await supabase
      .from('conversation_member_states')
      .upsert({
        conversation_id: conversationId,
        user_id: userId,
        visible_message_id: messageId,
        visible_message_created_at: msgData?.created_at || new Date().toISOString(),
      }, { onConflict: 'conversation_id, user_id' });

    if (error) throw error;
  },
};

