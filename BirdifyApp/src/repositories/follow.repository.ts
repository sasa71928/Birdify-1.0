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
        follower:profiles!follows_follower_id_fkey (id, username, full_name, avatar_url)
      `)
      .eq('following_id', userId);

    if (error) {
      console.error('Error in getFollowers:', error);
      throw error;
    }

    return data?.map((item: any) => ({
      ...item.follower,
      fullname: item.follower?.full_name,        // mapear al nombre que usa ProfileScreen
      profile_pic_url: item.follower?.avatar_url, // mapear al campo que usa ProfileScreen
    })).filter(Boolean) || [];
  },

  async getFollowing(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following:profiles!follows_following_id_fkey (id, username, full_name, avatar_url)
      `)
      .eq('follower_id', userId);

    if (error) {
      console.error('Error in getFollowing:', error);
      throw error;
    }

    return data?.map((item: any) => ({
      ...item.following,
      fullname: item.following?.full_name,
      profile_pic_url: item.following?.avatar_url,
    })).filter(Boolean) || [];
  }
};