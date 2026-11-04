import { supabase } from '../lib/supabase';
import { User, UpdateProfileDTO } from '../types/models';
import db from '../lib/database';
import { isOnline } from '../services/syncService';

export const PUBLIC_USER_COLUMNS =
  'id, username, fullname, bio, profile_pic_url, is_private, is_verified, user_level, created_at';

export const ProfileRepository = {
  async getById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select(PUBLIC_USER_COLUMNS)
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      throw error;
    }
    return data as User;
  },

  async update(userId: string, payload: UpdateProfileDTO): Promise<User> {
    const { is_verified: _iv, user_level: _ul, ...safePayload } = payload as Record<string, unknown>;
    const { data, error } = await supabase
      .from('users')
      .update(safePayload)
      .eq('id', userId)
      .select(PUBLIC_USER_COLUMNS)
      .single();

    if (error) throw error;
    return data as User;
  },

  async getAll(): Promise<any[]> {
    if (!isOnline) {
      try {
        const rows = await db.getAllAsync<any>(
          `SELECT id, username, fullname, bio, profile_pic_url, is_verified FROM users ORDER BY username ASC`
        );
        return rows || [];
      } catch {
        return [];
      }
    }
    const { data, error } = await supabase
      .from('users')
      .select('id, username, fullname, bio, profile_pic_url, is_verified')
      .order('username');

    if (error) throw error;
    return data || [];
  }
};
