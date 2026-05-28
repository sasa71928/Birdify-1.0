import { supabase } from '../lib/supabase';

export type ConversationRole = 'admin' | 'member';

export interface ConversationMember {
  conversation_id: string;
  user_id: string;
  joined_at?: string;
  role?: ConversationRole;
  user?: {
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
  };
}

export const ConversationRepository = {
  async listForUser(userId: string): Promise<ConversationListItem[]> {
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
            user:profiles!conversation_members_profile_id_fkey (id, username, full_name, avatar_url)
          )
        )
      `
      )
      .eq('user_id', userId);

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
      .select('conversation_id, sender_id, content, image_url, created_at')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false });

    if (msgError) throw msgError;

    const lastByConversation = new Map<string, any>();
    for (const m of messages || []) {
      if (!lastByConversation.has(m.conversation_id)) {
        lastByConversation.set(m.conversation_id, m);
      }
    }

    return filteredConversations.map((conversation) => ({
      conversation,
      lastMessage: lastByConversation.get(conversation.id),
    }));
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

    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({
        name,
        description: description || null,
        avatar_url: avatarUrl || null,
        is_group: true,
        created_by: creatorId,
      })
      .select('id')
      .single();

    if (convError) throw convError;
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
    const { error } = await supabase.from('conversations').delete().eq('id', conversationId);
    if (error) throw error;
  },
};

