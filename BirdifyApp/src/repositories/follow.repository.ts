import { supabase } from '../lib/supabase';
import db from '../lib/database';
import { isOnline, addToQueue } from '../services/syncService';

export const FollowRepository = {

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    // Siempre lee local — instantáneo
    const row = await db.getFirstAsync<{ follower_id: string }>(
      `SELECT follower_id FROM follows WHERE follower_id = ? AND following_id = ?`,
      [followerId, followingId]
    );
    return !!row;
  },

  async follow(followerId: string, followingId: string): Promise<void> {
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT OR IGNORE INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)`,
      [followerId, followingId, now]
    );

    if (isOnline) {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId });
      if (error) await addToQueue('follows', 'INSERT', { follower_id: followerId, following_id: followingId, created_at: now });
    } else {
      await addToQueue('follows', 'INSERT', { follower_id: followerId, following_id: followingId, created_at: now });
    }
  },

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await db.runAsync(
      `DELETE FROM follows WHERE follower_id = ? AND following_id = ?`,
      [followerId, followingId]
    );

    if (isOnline) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
      if (error) await addToQueue('follows', 'DELETE', { follower_id: followerId, following_id: followingId });
    } else {
      await addToQueue('follows', 'DELETE', { follower_id: followerId, following_id: followingId });
    }
  },

  async getFollowers(userId: string): Promise<any[]> {
    if (isOnline) {
      const { data, error } = await supabase
        .from('follows')
        .select(`follower:users!follows_follower_id_fkey (id, username, fullname, profile_pic_url)`)
        .eq('following_id', userId);

      if (error) throw error;

      const followers = data?.map((item: any) => item.follower).filter(Boolean) || [];

      // Cachea usuarios localmente
      for (const u of followers) {
        await db.runAsync(
          `INSERT OR REPLACE INTO users (id, username, fullname, profile_pic_url) VALUES (?, ?, ?, ?)`,
          [u.id, u.username, u.fullname ?? null, u.profile_pic_url ?? null]
        );
      }

      return followers;
    } else {
      const rows = await db.getAllAsync<any>(
        `SELECT u.id, u.username, u.fullname, u.profile_pic_url
         FROM follows f
         LEFT JOIN users u ON f.follower_id = u.id
         WHERE f.following_id = ?`,
        [userId]
      );
      return rows;
    }
  },

  async getFollowing(userId: string): Promise<any[]> {
    if (isOnline) {
      const { data, error } = await supabase
        .from('follows')
        .select(`following:users!follows_following_id_fkey (id, username, fullname, profile_pic_url)`)
        .eq('follower_id', userId);

      if (error) throw error;

      const following = data?.map((item: any) => item.following).filter(Boolean) || [];

      for (const u of following) {
        await db.runAsync(
          `INSERT OR REPLACE INTO users (id, username, fullname, profile_pic_url) VALUES (?, ?, ?, ?)`,
          [u.id, u.username, u.fullname ?? null, u.profile_pic_url ?? null]
        );
      }

      return following;
    } else {
      const rows = await db.getAllAsync<any>(
        `SELECT u.id, u.username, u.fullname, u.profile_pic_url
         FROM follows f
         LEFT JOIN users u ON f.following_id = u.id
         WHERE f.follower_id = ?`,
        [userId]
      );
      return rows;
    }
  }
};