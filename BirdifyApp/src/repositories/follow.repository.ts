import { supabase } from '../lib/supabase';

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
