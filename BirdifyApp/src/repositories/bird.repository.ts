import { supabase } from '../lib/supabase';
import { Bird } from '../types/models';

export const BirdRepository = {
  async getAll(): Promise<Bird[]> {
    const { data, error } = await supabase
      .from('birds')
      .select('*')
      .order('common_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async search(query: string): Promise<Bird[]> {
    const { data, error } = await supabase
      .from('birds')
      .select('*')
      .or(`common_name.ilike.%${query}%,scientific_name.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  }
};
