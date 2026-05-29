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

  async getFeed(currentUserId?: string): Promise<any[]> {
    let query = supabase
      .from('sightings')
      .select(`
        id,
        user_id,
        bird_id,
        description,
        photo_url,
        latitude,
        longitude,
        is_location_private,
        created_at,
        updated_at,
        users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
        birds (id, common_name, scientific_name),
        reactions (user_id),
        comments (id)
      `)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error in getFeed:', error);
      throw error;
    }

    // Si hay usuario actual, filtrar usuarios bloqueados en ambas direcciones.
    let filteredData = data || [];
    if (currentUserId) {
      const { data: blockedData, error: blockError } = await supabase
        .from('user_blocks')
        .select('blocker_id, blocked_id')
        .or(`blocker_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`);

      if (!blockError && blockedData) {
        const excludedUserIds = new Set(
          blockedData.map((block: any) =>
            block.blocker_id === currentUserId ? block.blocked_id : block.blocker_id
          )
        );
        filteredData = filteredData.filter(item => !excludedUserIds.has(item.user_id));
      }
    }

    // Formatear resultados
    const formattedData = filteredData.map(item => ({
      ...item,
      user: Array.isArray(item.users) ? item.users[0] : item.users,
      bird: item.birds,
      reactions: item.reactions || [],
      comments: item.comments || []
    }));

    return formattedData;
  },

  async getByUserId(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('sightings')
      .select(`
        id,
        user_id,
        bird_id,
        description,
        photo_url,
        latitude,
        longitude,
        is_location_private,
        created_at,
        updated_at,
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
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sightings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
