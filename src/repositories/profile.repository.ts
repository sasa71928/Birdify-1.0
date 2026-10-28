import { supabase } from '../lib/supabase';
import { User, UpdateProfileDTO } from '../types/models';

export const ProfileRepository = {
  async getById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      throw error;
    }
    return data;
  },

  async update(userId: string, payload: UpdateProfileDTO): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
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
