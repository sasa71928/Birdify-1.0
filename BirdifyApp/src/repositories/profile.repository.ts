import { supabase } from '../lib/supabase';
import { UserProfile, UpdateProfileDTO } from '../types/models';

export const ProfileRepository = {
  async getById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async update(userId: string, payload: UpdateProfileDTO): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
