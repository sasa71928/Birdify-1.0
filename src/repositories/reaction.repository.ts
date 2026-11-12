import { supabase } from '../lib/supabase';
import { Reaction } from '../types/models';
import db from '../lib/database';
import { isOnline, addToQueue } from '../services/syncService';

export const ReactionRepository = {
  // Agregar reacción (Me gusta / Like)
  async react(sightingId: string, userId: string): Promise<void> {
    if (!isOnline) {
      const existing = await db.getFirstAsync<{ user_id: string }>(
        `SELECT user_id FROM reactions WHERE user_id = ? AND sighting_id = ?`,
        [userId, sightingId]
      );
      await db.runAsync(
        `INSERT OR REPLACE INTO reactions (user_id, sighting_id, created_at) VALUES (?, ?, ?)`,
        [userId, sightingId, new Date().toISOString()]
      );
      if (!existing) {
        await db.runAsync(
          `UPDATE sightings SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = ?`,
          [sightingId]
        );
      }
      await addToQueue('reactions', 'INSERT', { sighting_id: sightingId, user_id: userId });
      return;
    }

    const { error } = await supabase
      .from('reactions')
      .insert({ sighting_id: sightingId, user_id: userId });

    const isDuplicate =
      error &&
      (error.code === '23505' ||
        error.message?.toLowerCase().includes('duplicate key') ||
        error.message?.toLowerCase().includes('unique constraint'));

    if (error && !isDuplicate) {
      console.error('Error reacting to sighting:', error);
      throw error;
    }

    try {
      const existing = await db.getFirstAsync<{ user_id: string }>(
        `SELECT user_id FROM reactions WHERE user_id = ? AND sighting_id = ?`,
        [userId, sightingId]
      );
      await db.runAsync(
        `INSERT OR REPLACE INTO reactions (user_id, sighting_id, created_at) VALUES (?, ?, ?)`,
        [userId, sightingId, new Date().toISOString()]
      );
      if (!existing && !isDuplicate) {
        await db.runAsync(
          `UPDATE sightings SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = ?`,
          [sightingId]
        );
      }
    } catch {
      // Non-blocking local SQLite cache update
    }
  },

  // Eliminar reacción (Quitar me gusta / Unlike)
  async unreact(sightingId: string, userId: string): Promise<void> {
    if (!isOnline) {
      const existing = await db.getFirstAsync<{ user_id: string }>(
        `SELECT user_id FROM reactions WHERE user_id = ? AND sighting_id = ?`,
        [userId, sightingId]
      );
      await db.runAsync(
        `DELETE FROM reactions WHERE user_id = ? AND sighting_id = ?`,
        [userId, sightingId]
      );
      if (existing) {
        await db.runAsync(
          `UPDATE sightings SET likes_count = MAX(0, COALESCE(likes_count, 0) - 1) WHERE id = ?`,
          [sightingId]
        );
      }
      await addToQueue('reactions', 'DELETE_REACTION', { sighting_id: sightingId, user_id: userId });
      return;
    }

    const { error } = await supabase
      .from('reactions')
      .delete()
      .match({ sighting_id: sightingId, user_id: userId });

    if (error) {
      console.error('Error unreacting to sighting:', error);
      throw error;
    }

    try {
      const existing = await db.getFirstAsync<{ user_id: string }>(
        `SELECT user_id FROM reactions WHERE user_id = ? AND sighting_id = ?`,
        [userId, sightingId]
      );
      await db.runAsync(
        `DELETE FROM reactions WHERE user_id = ? AND sighting_id = ?`,
        [userId, sightingId]
      );
      if (existing) {
        await db.runAsync(
          `UPDATE sightings SET likes_count = MAX(0, COALESCE(likes_count, 0) - 1) WHERE id = ?`,
          [sightingId]
        );
      }
    } catch {
      // Non-blocking local SQLite cache update
    }
  },

  // Verificar si un usuario ya le ha dado like
  async hasReacted(sightingId: string, userId: string): Promise<boolean> {
    if (!isOnline) {
      const row = await db.getFirstAsync<{user_id: string}>(
        `SELECT user_id FROM reactions WHERE user_id = ? AND sighting_id = ?`,
        [userId, sightingId]
      );
      return !!row;
    }

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
