import { supabase } from '../lib/supabase';
import { User, UpdateProfileDTO } from '../types/models';
import db from '../lib/database';
import { isOnline, addToQueue } from '../services/syncService';

export const ProfileRepository = {

  async getById(userId: string): Promise<User | null> {
    if (isOnline) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      // Cachea en local
      await db.runAsync(
        `INSERT OR REPLACE INTO users (id, email, username, fullname, bio, profile_pic_url, is_private, is_verified, user_level, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id, data.email, data.username, data.fullname ?? null,
          data.bio ?? null, data.profile_pic_url ?? null,
          data.is_private ? 1 : 0, data.is_verified ? 1 : 0,
          data.user_level, data.created_at,
        ]
      );

      return data;
    } else {
      // Sin red: lee del caché local
      const row = await db.getFirstAsync<User>(
        `SELECT * FROM users WHERE id = ?`,
        [userId]
      );
      return row ?? null;
    }
  },

  async update(userId: string, payload: UpdateProfileDTO): Promise<User> {
    if (isOnline) {
      const { data, error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Actualiza local también
      await db.runAsync(
        `UPDATE users SET fullname = ?, bio = ?, profile_pic_url = ?, is_private = ?
         WHERE id = ?`,
        [
          (payload as any).fullname ?? null,
          (payload as any).bio ?? null,
          (payload as any).profile_pic_url ?? null,
          (payload as any).is_private ? 1 : 0,
          userId,
        ]
      );

      return data;
    } else {
      // Sin red: actualiza local y encola
      await db.runAsync(
        `UPDATE users SET fullname = ?, bio = ?, profile_pic_url = ?, is_private = ?
         WHERE id = ?`,
        [
          (payload as any).fullname ?? null,
          (payload as any).bio ?? null,
          (payload as any).profile_pic_url ?? null,
          (payload as any).is_private ? 1 : 0,
          userId,
        ]
      );

      await addToQueue('users', 'UPDATE', { id: userId, ...payload });

      const row = await db.getFirstAsync<User>(
        `SELECT * FROM users WHERE id = ?`,
        [userId]
      );
      return row!;
    }
  }
};