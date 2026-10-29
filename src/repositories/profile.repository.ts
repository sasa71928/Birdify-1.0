import { supabase } from '../lib/supabase';
import { User, UpdateProfileDTO } from '../types/models';

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
    const { data, error } = await supabase
      .from('users')
      .select('id, username, fullname, profile_pic_url')
      .order('username');

    if (error) throw error;
    return data || [];
  }
};
