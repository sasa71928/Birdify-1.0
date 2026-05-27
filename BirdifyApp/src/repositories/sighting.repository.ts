import { supabase } from '../lib/supabase';
import { Sighting } from '../types/models';

export const SightingRepository = {
  async create(sighting: Omit<Sighting, 'id' | 'created_at' | 'updated_at'>): Promise<Sighting> {
    const { data, error } = await supabase
      .from('sightings')
      .insert(sighting)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, sighting: Partial<Omit<Sighting, 'id' | 'created_at' | 'updated_at'>>): Promise<Sighting> {
    const { data, error } = await supabase
      .from('sightings')
      .update(sighting)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getFeed(): Promise<any[]> {
    const { data, error } = await supabase
      .from('sightings')
      .select(`
        *,
        users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
        birds (id, common_name, scientific_name),
        reactions (user_id),
        comments (id)
      `)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error in getFeed:', error);
      throw error;
    }
    
    // Formateamos los resultados para que coincidan con la interfaz de Sighting (user y bird en vez de users y birds)
    const formattedData = data?.map(item => ({
      ...item,
      user: item.users,
      bird: item.birds,
      reactions: item.reactions || [],
      comments: item.comments || []
    }));

    return formattedData || [];
  },

  async getByUserId(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('sightings')
      .select(`
        *,
        users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
        birds (id, common_name, scientific_name),
        reactions (user_id),
        comments (id)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in getByUserId:', error);
      throw error;
    }

    const formattedData = data?.map(item => ({
      ...item,
      user: item.users,
      bird: item.birds,
      reactions: item.reactions || [],
      comments: item.comments || []
    }));

    return formattedData || [];
  }
};
