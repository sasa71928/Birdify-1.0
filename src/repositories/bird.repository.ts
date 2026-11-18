import { supabase } from '../lib/supabase';
import { Bird } from '../types/models';
import db from '../lib/database';
import { isOnline } from '../services/syncService';
import { isValidUuid } from '../utils/uuid';

export const BirdRepository = {
  async getAll(): Promise<Bird[]> {
    let remoteError: unknown = null;

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('birds')
          .select('*')
          .order('common_name', { ascending: true });

        if (!error && data) {
          const validBirds = data.filter((b) => isValidUuid(b?.id));
          // Guardar en SQLite en segundo plano
          try {
            const remoteIds = validBirds.map((b) => b.id);
            if (remoteIds.length > 0) {
              // Eliminar aves locales cacheadas con UUID que ya no existen en Supabase
              // (se conservan registros legacy no-UUID para no borrar referencias pendientes)
              const placeholders = remoteIds.map(() => '?').join(',');
              await db.runAsync(
                `DELETE FROM birds 
                 WHERE LENGTH(id) = 36 
                   AND id NOT IN (${placeholders})`,
                remoteIds
              );
            }

            for (const b of validBirds) {
              await db.runAsync(
                `INSERT OR REPLACE INTO birds (id, common_name, scientific_name, description, season, habitat_info, ideal_zones, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [b.id, b.common_name, b.scientific_name, b.description, b.season, b.habitat_info, b.ideal_zones, b.image_url ?? null]
              );
            }
          } catch (sqliteErr) {
            console.error('Error guardando birds en SQLite:', sqliteErr);
          }
          return validBirds;
        }
        remoteError = error;
      } catch (e) {
        remoteError = e;
        console.log('Error fetching birds from Supabase, falling back to SQLite:', e);
      }
    }

    // Fallback a SQLite (solo especies con UUID válido del catálogo)
    const localBirds = await db.getAllAsync<Bird>(
      `SELECT * FROM birds ORDER BY common_name ASC`
    );
    const validLocalBirds = (localBirds || []).filter((b) => isValidUuid(b?.id));

    if (validLocalBirds.length === 0 && remoteError) {
      throw remoteError;
    }

    return validLocalBirds;
  },

  async getById(birdId: string): Promise<Bird | null> {
    if (!isValidUuid(birdId)) {
      return null;
    }

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('birds')
          .select('*')
          .eq('id', birdId)
          .maybeSingle();

        if (!error) {
          return (data as Bird) ?? null;
        }
      } catch (e) {
        console.log('Error fetching bird by id from Supabase, falling back to SQLite:', e);
      }
    }

    const localBird = await db.getFirstAsync<Bird>(
      `SELECT * FROM birds WHERE id = ? LIMIT 1`,
      [birdId]
    );
    return localBird ?? null;
  },

  async search(query: string): Promise<Bird[]> {
    const sanitized = query.replace(/[%_,().\\*]/g, '').trim();
    if (!sanitized) return [];

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('birds')
          .select('*')
          .or(`common_name.ilike.%${sanitized}%,scientific_name.ilike.%${sanitized}%`)
          .limit(10);

        if (!error && data) {
          return data.filter((b) => isValidUuid(b?.id));
        }
      } catch (e) {
        console.log('Error searching birds from Supabase, falling back to SQLite:', e);
      }
    }

    // Fallback a SQLite
    const localBirds = await db.getAllAsync<Bird>(
      `SELECT * FROM birds WHERE common_name LIKE ? OR scientific_name LIKE ? LIMIT 10`,
      [`%${sanitized}%`, `%${sanitized}%`]
    );
    return (localBirds || []).filter((b) => isValidUuid(b?.id));
  }
};
