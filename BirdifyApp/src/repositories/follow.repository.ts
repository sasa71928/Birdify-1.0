import { supabase } from '../lib/supabase';
import { PushNotificationSender } from '../services/push.sender';
import { NotificationPreferencesService } from '../services/notification.preferences';

export const FollowRepository = {
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) {
      console.error('Error in isFollowing:', error);
      return false;
    }
    return !!data;
  },

  async follow(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });

    if (error) {
      console.error('Error in follow:', error);
      throw error;
    }

    // Notificar al usuario seguido
    this.notifyFollowed(followerId, followingId).catch(() => {});
  },

  async notifyFollowed(followerId: string, followingId: string): Promise<void> {
    try {
      const isEnabled = await NotificationPreferencesService.isPushEnabled(followingId, 'new_follower');
      if (!isEnabled) return;

      const token = await NotificationPreferencesService.getPushToken(followingId);
      if (!token) return;

      // Obtener nombre del seguidor
      const { data: follower } = await supabase
        .from('users')
        .select('username, fullname')
        .eq('id', followerId)
        .single();

      const name = follower?.fullname || follower?.username || 'Alguien';

      await PushNotificationSender.send({
        to: token,
        sound: 'default',
        title: 'Nuevo seguidor',
        body: `${name} empezó a seguirte`,
        data: { type: 'new_follower', followerId },
      });
    } catch (e) {
      console.error('Error notifying followed user:', e);
    }
  },

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Error in unfollow:', error);
      throw error;
    }
  },

  async getFollowers(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower:users!follows_follower_id_fkey (id, username, fullname, profile_pic_url)
      `)
      .eq('following_id', userId);

    if (error) {
      console.error('Error in getFollowers:', error);
      throw error;
    }

    return data?.map((item: any) => item.follower).filter(Boolean) || [];
  },

  async getFollowing(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following:users!follows_following_id_fkey (id, username, fullname, profile_pic_url)
      `)
      .eq('follower_id', userId);

    if (error) {
      console.error('Error in getFollowing:', error);
      throw error;
    }

    return data?.map((item: any) => item.following).filter(Boolean) || [];
  },

  async areMutualFollowers(userAId: string, userBId: string): Promise<boolean> {
    const [aFollowsB, bFollowsA] = await Promise.all([
      this.isFollowing(userAId, userBId),
      this.isFollowing(userBId, userAId),
    ]);

    return aFollowsB && bFollowsA;
  }
};
