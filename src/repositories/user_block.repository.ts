import { supabase } from '../lib/supabase';

export const UserBlockRepository = {
  async block(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) {
      throw new Error('Cannot block yourself');
    }

    // Deseguir mutuamente (best-effort, sin necesidad de FK específicas)
    try {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', blockerId)
        .eq('following_id', blockedId);
    } catch {
      // Ignorar errores
    }

    try {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', blockedId)
        .eq('following_id', blockerId);
    } catch {
      // Ignorar errores
    }

    const { error } = await supabase
      .from('user_blocks')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId
      });

    if (error) throw error;
  },

  async unblock(blockerId: string, blockedId: string): Promise<void> {
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);

    if (error) throw error;
  },

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_blocks')
      .select('blocker_id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  async getBlockedUsers(blockerId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_blocks')
      .select('blocked_id')
      .eq('blocker_id', blockerId);

    if (error) {
      console.error('Error fetching blocked users:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Fetch user details por bloqueados
    const blockedIds = data.map((b: any) => b.blocked_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, fullname, profile_pic_url')
      .in('id', blockedIds);

    if (usersError) {
      console.error('Error fetching blocked user details:', usersError);
      return [];
    }

    return users || [];
  }
};
