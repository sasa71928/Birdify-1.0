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

export const MessageRepository = {
  async list(conversationId: string): Promise<MessageRow[]> {
    const { data, error } = await supabase
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
      `
      )
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Fetch reply details separately for messages that have reply_to_id
    const messages = (data || []) as any[];
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
    
    return messages;
  },

  async send(params: {
    conversationId: string;
    senderId: string;
    content?: string | null;
    imageUrl?: string | null;
    replyToId?: string | null;
  }): Promise<void> {
    const { conversationId, senderId, content, imageUrl, replyToId } = params;
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content ?? null,
      image_url: imageUrl ?? null,
      reply_to_id: replyToId ?? null,
    });
    if (error) throw error;
  },

  async delete(messageId: string, senderId: string): Promise<void> {
    const { error } = await supabase.from('messages').delete().eq('id', messageId).eq('sender_id', senderId);
    if (error) throw error;
  },
};

