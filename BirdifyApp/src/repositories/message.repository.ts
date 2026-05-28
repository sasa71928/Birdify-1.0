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
        sender:profiles!messages_sender_id_fkey (id, username, avatar_url)
      `
      )
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as any;
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

