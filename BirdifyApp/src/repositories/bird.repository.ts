import { supabase } from '../lib/supabase';
import { Bird } from '../types/models';
import db from '../lib/database';
import { isOnline } from '../services/syncService';

export const BirdRepository = {
  async getAll(): Promise<Bird[]> {
    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('birds')
          .select('*')
          .order('common_name', { ascending: true });

        if (!error && data) {
          // Guardar en SQLite en segundo plano
          try {
            for (const b of data) {
              await db.runAsync(
                `INSERT OR REPLACE INTO birds (id, common_name, scientific_name, description, season, habitat_info, ideal_zones) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [b.id, b.common_name, b.scientific_name, b.description, b.season, b.habitat_info, b.ideal_zones]
              );
            }
          } catch (sqliteErr) {
            console.error('Error guardando birds en SQLite:', sqliteErr);
          }
          return data;
        }
      } catch (e) {
        console.log('Error fetching birds from Supabase, falling back to SQLite:', e);
      }
    }

    // Fallback a SQLite
    const localBirds = await db.getAllAsync<Bird>(
      `SELECT * FROM birds ORDER BY common_name ASC`
    );
    return localBirds;
  },

  async search(query: string): Promise<Bird[]> {
    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('birds')
          .select('*')
          .or(`common_name.ilike.%${query}%,scientific_name.ilike.%${query}%`)
          .limit(10);

        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.log('Error searching birds from Supabase, falling back to SQLite:', e);
      }
    }

    // Fallback a SQLite
    const localBirds = await db.getAllAsync<Bird>(
      `SELECT * FROM birds WHERE common_name LIKE ? OR scientific_name LIKE ? LIMIT 10`,
      [`%${query}%`, `%${query}%`]
    );
    return localBirds;
  }
};
