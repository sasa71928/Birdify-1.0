import { supabase } from '../lib/supabase';
import { Reaction } from '../types/models';

export const ReactionRepository = {
  // Agregar reacción (Me gusta / Like)
  async react(sightingId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('reactions')
      .insert({ sighting_id: sightingId, user_id: userId });

    if (error) {
      console.error('Error reacting to sighting:', error);
      throw error;
    }
  },

  // Eliminar reacción (Quitar me gusta / Unlike)
  async unreact(sightingId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .match({ sighting_id: sightingId, user_id: userId });

    if (error) {
      console.error('Error unreacting to sighting:', error);
      throw error;
    }
  },

  // Verificar si un usuario ya le ha dado like
  async hasReacted(sightingId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('reactions')
      .select('created_at')
      .match({ sighting_id: sightingId, user_id: userId })
      .maybeSingle();

    if (error) {
      console.error('Error in hasReacted:', error);
      return false;
    }
    return !!data;
  }
};
