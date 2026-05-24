import { supabase } from '../lib/supabase';
import db from '../lib/database';
import { isOnline, addToQueue } from '../services/syncService';

export const ReactionRepository = {

  async react(sightingId: string, userId: string): Promise<void> {
    const now = new Date().toISOString();

    // 1. Guarda local siempre
    await db.runAsync(
      `INSERT OR IGNORE INTO reactions (user_id, sighting_id, created_at) VALUES (?, ?, ?)`,
      [userId, sightingId, now]
    );

    // 2. Sube a Supabase o encola
    if (isOnline) {
      const { error } = await supabase
        .from('reactions')
        .insert({ sighting_id: sightingId, user_id: userId });
      if (error) {
        console.warn('⚠️ Encolando reaction...', error);
        await addToQueue('reactions', 'INSERT', { user_id: userId, sighting_id: sightingId, created_at: now });
      }
    } else {
      await addToQueue('reactions', 'INSERT', { user_id: userId, sighting_id: sightingId, created_at: now });
    }
  },

  async unreact(sightingId: string, userId: string): Promise<void> {
    // 1. Borra local siempre
    await db.runAsync(
      `DELETE FROM reactions WHERE user_id = ? AND sighting_id = ?`,
      [userId, sightingId]
    );

    // 2. Borra en Supabase o encola
    if (isOnline) {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .match({ sighting_id: sightingId, user_id: userId });
      if (error) {
        console.warn('⚠️ Encolando unreact...', error);
        await addToQueue('reactions', 'DELETE', { user_id: userId, sighting_id: sightingId });
      }
    } else {
      await addToQueue('reactions', 'DELETE', { user_id: userId, sighting_id: sightingId });
    }
  },

  async hasReacted(sightingId: string, userId: string): Promise<boolean> {
    // Siempre lee local — es instantáneo
    const row = await db.getFirstAsync<{ user_id: string }>(
      `SELECT user_id FROM reactions WHERE user_id = ? AND sighting_id = ?`,
      [userId, sightingId]
    );
    return !!row;
  }
};