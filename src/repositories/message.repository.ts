import { supabase } from '../lib/supabase';

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  reply_to_id: string | null;
  created_at?: string;
  sender?: {
    id: string;
    username: string;
    profile_pic_url: string | null;
  };
  reply_to?: {
    content: string | null;
    image_url: string | null;
    sender: {
      username: string;
      fullname: string;
    };
  };
}

export interface PaginatedMessagesResult {
  messages: MessageRow[];
  hasMore: boolean;
}

export const MessageRepository = {
  async list(conversationId: string): Promise<MessageRow[]> {
    // Delegar a paginaci├│n con un l├¡mite alto para compatibilidad
    const result = await this.listPaginated(conversationId, 1000);
    return result.messages;
  },

  async listPaginated(
    conversationId: string,
    limit: number = 50,
    beforeMessageId?: string
  ): Promise<PaginatedMessagesResult> {
    let query = supabase
      .from('messages')
      .select(
        `
        id,
        conversation_id,
        sender_id,
        content,
        image_url,
        reply_to_id,
        created_at,
        sender:users (id, username, profile_pic_url)
      `,
        { count: 'exact' }
      )
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (beforeMessageId) {
      // Traer mensajes con created_at menor al del cursor
      const { data: cursorMsg } = await supabase
        .from('messages')
        .select('created_at')
        .eq('id', beforeMessageId)
        .single();
      if (cursorMsg) {
        query = query.lt('created_at', cursorMsg.created_at);
      }
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const messages = (data || []) as any[];

    // Fetch reply details separately for messages that have reply_to_id
    const replyToIds = messages
      .map(m => m.reply_to_id)
      .filter(id => id != null);

    if (replyToIds.length > 0) {
      const { data: replyData } = await supabase
        .from('messages')
        .select('id, content, image_url, sender:users (username, fullname)')
        .in('id', replyToIds);

      const replyMap = new Map((replyData || []).map(r => [r.id, r]));

      messages.forEach(m => {
        if (m.reply_to_id) {
          const reply = replyMap.get(m.reply_to_id);
          if (reply) {
            const senderData = Array.isArray(reply.sender) ? reply.sender[0] : reply.sender;
            const username = senderData?.fullname || senderData?.username || 'Usuario';
            m.reply_to = {
              content: reply.content,
              image_url: reply.image_url,
              sender: { username }
            };
          }
        }
      });
    }

    const hasMore = messages.length >= limit;
    return { messages, hasMore };
  },

  async send(params: {
    conversationId: string;
    senderId: string;
    content?: string | null;
    imageUrl?: string | null;
    replyToId?: string | null;
  }): Promise<any> {
    const { conversationId, senderId, content, imageUrl, replyToId } = params;
    const { data, error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content ?? null,
      image_url: imageUrl ?? null,
      reply_to_id: replyToId ?? null,
    }).select().single();
    if (error) throw error;

    return data;
  },

  async delete(messageId: string, senderId: string): Promise<void> {
    const { error } = await supabase.from('messages').delete().eq('id', messageId).eq('sender_id', senderId);
    if (error) throw error;
  },
};

