import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import db from '../lib/database';
import { isOnline } from '../services/syncService';

const getFollowingSyncedKey = (userId: string) => `@birdify_following_synced_${userId}`;
const getFollowersSyncedKey = (userId: string) => `@birdify_followers_synced_${userId}`;

export const FollowRepository = {
  async clearSyncFlags(userId: string): Promise<void> {
    if (!userId) return;
    try {
      await AsyncStorage.multiRemove([
        getFollowingSyncedKey(userId),
        getFollowersSyncedKey(userId),
      ]);
    } catch {
      // Ignorar errores de limpieza en AsyncStorage
    }
  },

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    if (!isOnline) {
      const row = await db.getFirstAsync<{ follower_id: string }>(
        `SELECT follower_id FROM follows WHERE follower_id = ? AND following_id = ?`,
        [followerId, followingId]
      );
      return !!row;
    }

    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) {
      console.error('Error in isFollowing:', error);
      return false;
    }
    return !!data;
  },

  async getFollowingIds(followerId: string): Promise<Set<string>> {
    if (!isOnline) {
      const synced = await AsyncStorage.getItem(getFollowingSyncedKey(followerId));
      if (!synced) {
        throw new Error('Sin conexión: aún no se ha sincronizado tu lista de seguidos.');
      }
      const rows = await db.getAllAsync<{ following_id: string }>(
        `SELECT following_id FROM follows WHERE follower_id = ?`,
        [followerId]
      );
      return new Set<string>(
        (rows ?? [])
          .map((row) => row.following_id)
          .filter((id): id is string => Boolean(id))
      );
    }

    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', followerId);

    if (error) {
      console.error('Error in getFollowingIds:', error);
      throw error;
    }

    const followingIds = (data ?? [])
      .map((row: { following_id?: string | null }) => row.following_id)
      .filter((id): id is string => Boolean(id));

    try {
      await db.runAsync(`DELETE FROM follows WHERE follower_id = ?`, [followerId]);
      for (const targetId of followingIds) {
        await db.runAsync(
          `INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)`,
          [followerId, targetId]
        );
      }
      await AsyncStorage.setItem(getFollowingSyncedKey(followerId), 'true');
    } catch {
      // Actualización no bloqueante de caché SQLite
    }

    return new Set<string>(followingIds);
  },

  async getFollowerIds(followingId: string): Promise<Set<string>> {
    if (!isOnline) {
      const synced = await AsyncStorage.getItem(getFollowersSyncedKey(followingId));
      if (!synced) {
        throw new Error('Sin conexión: aún no se ha sincronizado tu lista de seguidores.');
      }
      const rows = await db.getAllAsync<{ follower_id: string }>(
        `SELECT follower_id FROM follows WHERE following_id = ?`,
        [followingId]
      );
      return new Set<string>(
        (rows ?? [])
          .map((row) => row.follower_id)
          .filter((id): id is string => Boolean(id))
      );
    }

    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', followingId);

    if (error) {
      console.error('Error in getFollowerIds:', error);
      throw error;
    }

    const followerIds = (data ?? [])
      .map((row: { follower_id?: string | null }) => row.follower_id)
      .filter((id): id is string => Boolean(id));

    try {
      await db.runAsync(`DELETE FROM follows WHERE following_id = ?`, [followingId]);
      for (const sourceId of followerIds) {
        await db.runAsync(
          `INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)`,
          [sourceId, followingId]
        );
      }
      await AsyncStorage.setItem(getFollowersSyncedKey(followingId), 'true');
    } catch {
      // Actualización no bloqueante de caché SQLite
    }

    return new Set<string>(followerIds);
  },

  async follow(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });

    if (error) {
      console.error('Error in follow:', error);
      throw error;
    }

    try {
      await db.runAsync(
        `INSERT OR IGNORE INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)`,
        [followerId, followingId, new Date().toISOString()]
      );
    } catch {
      // Actualización no bloqueante de caché SQLite
    }

    DeviceEventEmitter.emit('follows_changed', {
      followerId,
      followingId,
      action: 'follow',
    });
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

    try {
      await db.runAsync(
        `DELETE FROM follows WHERE follower_id = ? AND following_id = ?`,
        [followerId, followingId]
      );
    } catch {
      // Actualización no bloqueante de caché SQLite
    }

    DeviceEventEmitter.emit('follows_changed', {
      followerId,
      followingId,
      action: 'unfollow',
    });
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
  },
};
