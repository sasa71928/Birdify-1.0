import { supabase } from '../lib/supabase';
import { Bird } from '../types/models';
import db from '../lib/database';
import { isOnline } from '../services/syncService';

export const BirdRepository = {

  async getAll(): Promise<Bird[]> {
    if (isOnline) {
      const { data, error } = await supabase
        .from('birds')
        .select('*')
        .order('common_name', { ascending: true });

      if (error) throw error;

      // Cachea en SQLite local
      for (const bird of data ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO birds (id, common_name, scientific_name, description, season, habitat_info, ideal_zones)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [bird.id, bird.common_name, bird.scientific_name, bird.description ?? null,
           bird.season ?? null, bird.habitat_info ?? null, bird.ideal_zones ?? null]
        );
      }

      return data || [];
    } else {
      // Sin red: lee del caché local
      const rows = await db.getAllAsync<Bird>(
        `SELECT * FROM birds ORDER BY common_name ASC`
      );
      return rows;
    }
  },

  async search(query: string): Promise<Bird[]> {
    if (isOnline) {
      const { data, error } = await supabase
        .from('birds')
        .select('*')
        .or(`common_name.ilike.%${query}%,scientific_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    } else {
      const rows = await db.getAllAsync<Bird>(
        `SELECT * FROM birds
         WHERE common_name LIKE ? OR scientific_name LIKE ?
         LIMIT 10`,
        [`%${query}%`, `%${query}%`]
      );
      return rows;
    }
  }
};