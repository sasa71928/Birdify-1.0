import { supabase } from '../lib/supabase';

export interface MessageRead {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export const MessageReadRepository = {
  async markAsRead(messageId: string, userId: string): Promise<void> {
    // Check if already read
    const { data: existing } = await supabase
      .from('message_reads')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .single();

    if (existing) return; // Already marked as read

    const { error } = await supabase
      .from('message_reads')
      .insert({
        message_id: messageId,
        user_id: userId,
      });

    if (error) throw error;
  },

  async markMultipleAsRead(messageIds: string[], userId: string): Promise<void> {
    if (messageIds.length === 0) return;

    // Get already read message IDs
    const { data: existingReads } = await supabase
      .from('message_reads')
      .select('message_id')
      .in('message_id', messageIds)
      .eq('user_id', userId);

    const readMessageIds = new Set((existingReads || []).map((r) => r.message_id));
    const unreadMessageIds = messageIds.filter((id) => !readMessageIds.has(id));

    if (unreadMessageIds.length === 0) return;

    const rows = unreadMessageIds.map((messageId) => ({
      message_id: messageId,
      user_id: userId,
    }));

    const { error } = await supabase
      .from('message_reads')
      .insert(rows);

    if (error) throw error;
  },

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const messageIds = data.map((m) => m.id);

    const { data: readData, error: readError } = await supabase
      .from('message_reads')
      .select('message_id')
      .in('message_id', messageIds)
      .eq('user_id', userId);

    if (readError) throw readError;

    const readMessageIds = new Set((readData || []).map((r) => r.message_id));
    const unreadCount = messageIds.filter((id) => !readMessageIds.has(id)).length;

    return unreadCount;
  },

  async getReadStatus(messageId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('message_reads')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return false;
      throw error;
    }

    return !!data;
  },
};
