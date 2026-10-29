import { supabase } from '../lib/supabase';
import { Sighting } from '../types/models';
import db from '../lib/database';
import { isOnline, addToQueue, generateId } from '../services/syncService';

// Lista blanca estricta de columnas permitidas en UPDATE dinámico sobre SQLite (AUD-018)
const ALLOWED_SIGHTING_UPDATE_COLUMNS = new Set([
  'bird_id',
  'description',
  'latitude',
  'longitude',
  'is_location_private',
  'photo_url',
  'local_photo_path',
  'sighting_date',
]);

async function getExcludedUserIds(currentUserId?: string): Promise<Set<string>> {
  const excluded = new Set<string>();
  if (!currentUserId || !isOnline) return excluded;

  const { data: blockedData, error: blockError } = await supabase
    .from('user_blocks')
    .select('blocker_id, blocked_id')
    .or(`blocker_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`);

  if (!blockError && blockedData) {
    for (const block of blockedData as Array<{ blocker_id: string; blocked_id: string }>) {
      excluded.add(block.blocker_id === currentUserId ? block.blocked_id : block.blocker_id);
    }
  }
  return excluded;
}

export const SightingRepository = {
  async create(sighting: Omit<Sighting, 'id' | 'created_at' | 'updated_at'>): Promise<Sighting> {
    // ── MODO OFFLINE ──────────────────────────────────────────────────────────
    if (!isOnline) {
      const localId = generateId();
      const now = new Date().toISOString();
      const localRecord: any = {
        id: localId,
        ...sighting,
        sync_status: 'pending',
        created_at: now,
        updated_at: now,
      };

      await db.runAsync(
        `INSERT INTO sightings
          (id, user_id, bird_id, description, latitude, longitude,
           is_location_private, photo_url, local_photo_path, created_at, updated_at, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          localRecord.id,
          localRecord.user_id,
          localRecord.bird_id ?? null,
          localRecord.description ?? null,
          localRecord.is_location_private ? null : (localRecord.latitude ?? null),
          localRecord.is_location_private ? null : (localRecord.longitude ?? null),
          localRecord.is_location_private ? 1 : 0,
          localRecord.photo_url ?? null,
          (sighting as any)._localImagePaths ?? null,
          localRecord.created_at,
          localRecord.updated_at,
          'pending',
        ]
      );

      if ((sighting as any)._birdName && localRecord.bird_id) {
        await db
          .runAsync(
            `INSERT OR REPLACE INTO birds (id, common_name, scientific_name) VALUES (?, ?, ?)`,
            [
              localRecord.bird_id,
              (sighting as any)._birdName,
              (sighting as any)._scientificName ?? (sighting as any)._birdName + ' sp.',
            ]
          )
          .catch(() => {});
      }

      const queuePayload: any = { ...sighting, id: localId };
      if ((sighting as any)._localImagePaths) {
        queuePayload._localImagePaths = (sighting as any)._localImagePaths;
        queuePayload._birdName = (sighting as any)._birdName;
        queuePayload._scientificName = (sighting as any)._scientificName;
      }
      await addToQueue('sightings', 'INSERT', queuePayload);

      return localRecord as Sighting;
    }

    // ── MODO ONLINE ───────────────────────────────────────────────────────────
    const { _localImagePaths, _birdName, _scientificName, ...cleanSighting } = sighting as any;

    const { data, error } = await supabase
      .from('sightings')
      .insert(cleanSighting)
      .select()
      .single();

    if (error) throw error;

    db.runAsync(
      `INSERT INTO sightings
        (id, user_id, bird_id, description, latitude, longitude,
         is_location_private, photo_url, local_photo_path, created_at, updated_at, sync_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced')
       ON CONFLICT(id) DO UPDATE SET
         photo_url   = excluded.photo_url,
         bird_id     = excluded.bird_id,
         sync_status = 'synced',
         updated_at  = excluded.updated_at`,
      [
        data.id,
        data.user_id,
        data.bird_id,
        data.description,
        data.latitude,
        data.longitude,
        data.is_location_private ? 1 : 0,
        data.photo_url,
        (sighting as any)._localImagePaths ?? null,
        data.created_at,
        data.updated_at,
      ]
    ).catch(() => {});

    if (_birdName && data.bird_id) {
      db.runAsync(
        `INSERT OR REPLACE INTO birds (id, common_name, scientific_name) VALUES (?, ?, ?)`,
        [
          data.bird_id,
          _birdName,
          _scientificName ?? _birdName + ' sp.',
        ]
      ).catch(() => {});
    }

    return data;
  },

  async update(
    id: string,
    changes: Partial<Omit<Sighting, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Sighting> {
    const now = new Date().toISOString();

    // AUD-018: Filtrar estrictamente contra lista blanca de columnas válidas
    const safeEntries = Object.entries(changes).filter(([key]) =>
      ALLOWED_SIGHTING_UPDATE_COLUMNS.has(key)
    );
    const safeChanges = Object.fromEntries(safeEntries);
    const fields = safeEntries.map(([key]) => key);
    const values: Array<string | number | null> = safeEntries.map(([key, val]) => {
      if (key === 'is_location_private') return val ? 1 : 0;
      if (val === null || val === undefined) return null;
      if (typeof val === 'number' || typeof val === 'string') return val;
      if (typeof val === 'boolean') return val ? 1 : 0;
      return JSON.stringify(val);
    });

    if (fields.length === 0) {
      throw new Error('No hay campos válidos para actualizar.');
    }

    const setClause = fields.map((f) => `${f} = ?`).join(', ');

    if (!isOnline) {
      await db.runAsync(
        `UPDATE sightings SET ${setClause}, updated_at = ?, sync_status = 'pending' WHERE id = ?`,
        [...values, now, id]
      );

      await addToQueue('sightings', 'UPDATE', { id, ...safeChanges, updated_at: now });

      const row = await db.getFirstAsync<Sighting>(`SELECT * FROM sightings WHERE id = ?`, [id]);
      if (!row) throw new Error('Sighting no encontrado');
      return row;
    }

    const { data, error } = await supabase
      .from('sightings')
      .update({ ...safeChanges, updated_at: now })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await db
      .runAsync(
        `UPDATE sightings SET ${setClause}, updated_at = ?, sync_status = 'synced' WHERE id = ?`,
        [...values, now, id]
      )
      .catch(() => {});

    return data;
  },

  async getFeed(currentUserId?: string, page = 0, limit = 20): Promise<any[]> {
    if (!isOnline) {
      const rows = await db.getAllAsync<any>(
        `SELECT s.*, u.username, u.fullname, u.profile_pic_url, u.is_verified,
                b.common_name, b.scientific_name
         FROM sightings s
         LEFT JOIN users u ON s.user_id = u.id
         LEFT JOIN birds b ON s.bird_id = b.id
         ORDER BY s.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, page * limit]
      );

      const sightingIds = rows.map((r) => r.id);

      let localReactions: any[] = [];
      let localComments: any[] = [];
      if (sightingIds.length > 0) {
        const placeholders = sightingIds.map(() => '?').join(',');
        localReactions = await db.getAllAsync<any>(
          `SELECT sighting_id, user_id FROM reactions WHERE sighting_id IN (${placeholders})`,
          ...sightingIds
        );
        localComments = await db.getAllAsync<any>(
          `SELECT id, sighting_id FROM comments WHERE sighting_id IN (${placeholders})`,
          ...sightingIds
        );
      }

      return rows.map((r) => ({
        ...r,
        photo_url: r.local_photo_path ?? r.photo_url,
        user: {
          id: r.user_id,
          username: r.username,
          fullname: r.fullname,
          profile_pic_url: r.profile_pic_url,
          is_verified: r.is_verified,
        },
        bird: r.common_name
          ? { id: r.bird_id, common_name: r.common_name, scientific_name: r.scientific_name }
          : null,
        reactions: localReactions.filter((react) => react.sighting_id === r.id),
        comments: localComments.filter((comment) => comment.sighting_id === r.id),
      }));
    }

    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('sightings')
      .select(`
        id, user_id, bird_id, description, photo_url,
        latitude, longitude, is_location_private, created_at, updated_at,
        users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
        birds (id, common_name, scientific_name),
        reactions (user_id),
        comments (id)
      `)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error in getFeed:', error);
      throw error;
    }

    const excludedUserIds = await getExcludedUserIds(currentUserId);
    const filteredData = (data || []).filter((item) => !excludedUserIds.has(item.user_id));

    const formattedData = filteredData.map((item) => ({
      ...item,
      user: Array.isArray(item.users) ? item.users[0] : item.users,
      bird: item.birds,
      reactions: item.reactions || [],
      comments: item.comments || [],
    }));

    await Promise.all(
      formattedData.map(async (item) => {
        try {
          await db.runAsync(
            `INSERT INTO sightings
              (id, user_id, bird_id, description, latitude, longitude,
               is_location_private, photo_url, created_at, updated_at, sync_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced')
             ON CONFLICT(id) DO UPDATE SET
               bird_id     = excluded.bird_id,
               photo_url   = excluded.photo_url,
               sync_status = 'synced',
               updated_at  = excluded.updated_at`,
            [
              item.id,
              item.user_id,
              item.bird_id,
              item.description,
              item.is_location_private ? null : item.latitude,
              item.is_location_private ? null : item.longitude,
              item.is_location_private ? 1 : 0,
              item.photo_url,
              item.created_at,
              item.updated_at,
            ]
          );

          if (item.bird) {
            const bird = Array.isArray(item.bird) ? item.bird[0] : item.bird;
            if (bird) {
              await db.runAsync(
                `INSERT OR REPLACE INTO birds (id, common_name, scientific_name) VALUES (?, ?, ?)`,
                [bird.id, bird.common_name, bird.scientific_name]
              );
            }
          }
          if (item.user) {
            await db.runAsync(
              `INSERT OR REPLACE INTO users (id, username, fullname, profile_pic_url, is_verified)
               VALUES (?, ?, ?, ?, ?)`,
              [
                item.user.id,
                item.user.username,
                item.user.fullname,
                item.user.profile_pic_url,
                item.user.is_verified ? 1 : 0,
              ]
            );
          }

          if (item.reactions && item.reactions.length > 0) {
            for (const react of item.reactions) {
              await db.runAsync(
                `INSERT OR IGNORE INTO reactions (user_id, sighting_id) VALUES (?, ?)`,
                [react.user_id, item.id]
              );
            }
          }

          if (item.comments && item.comments.length > 0) {
            for (const comm of item.comments) {
              await db.runAsync(
                `INSERT OR IGNORE INTO comments (id, sighting_id) VALUES (?, ?)`,
                [comm.id, item.id]
              );
            }
          }
        } catch (err) {
          console.error('Error caching item in getFeed:', err);
        }
      })
    );

    return formattedData;
  },

  /**
   * Consulta avistamientos filtrando directamente por bird_id en servidor/SQLite (AUD-020),
   * evitando el truncado a los últimos 20 posts globales.
   */
  async getByBirdId(birdId: string, currentUserId?: string, limit = 50): Promise<any[]> {
    if (!isOnline) {
      const rows = await db.getAllAsync<any>(
        `SELECT s.*, u.username, u.fullname, u.profile_pic_url, u.is_verified,
                b.common_name, b.scientific_name
         FROM sightings s
         LEFT JOIN users u ON s.user_id = u.id
         LEFT JOIN birds b ON s.bird_id = b.id
         WHERE s.bird_id = ?
         ORDER BY s.created_at DESC
         LIMIT ?`,
        [birdId, limit]
      );

      return rows.map((r) => ({
        ...r,
        photo_url: r.local_photo_path ?? r.photo_url,
        user: {
          id: r.user_id,
          username: r.username,
          fullname: r.fullname,
          profile_pic_url: r.profile_pic_url,
          is_verified: r.is_verified,
        },
        bird: r.common_name
          ? { id: r.bird_id, common_name: r.common_name, scientific_name: r.scientific_name }
          : null,
        reactions: [],
        comments: [],
      }));
    }

    const { data, error } = await supabase
      .from('sightings')
      .select(`
        id, user_id, bird_id, description, photo_url,
        latitude, longitude, is_location_private, created_at, updated_at,
        users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
        birds (id, common_name, scientific_name),
        reactions (user_id),
        comments (id)
      `)
      .eq('bird_id', birdId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error in getByBirdId:', error);
      throw error;
    }

    const excludedUserIds = await getExcludedUserIds(currentUserId);
    return (data || [])
      .filter((item) => !excludedUserIds.has(item.user_id))
      .map((item) => ({
        ...item,
        user: Array.isArray(item.users) ? item.users[0] : item.users,
        bird: item.birds,
        reactions: item.reactions || [],
        comments: item.comments || [],
      }));
  },

  /**
   * Consulta marcadores geográficos públicos dedicados para el mapa Explore (AUD-020),
   * filtrando ubicaciones privadas y usuarios bloqueados sin truncar a 20 registros.
   */
  async getForMap(currentUserId?: string, limit = 200): Promise<any[]> {
    if (!isOnline) {
      const rows = await db.getAllAsync<any>(
        `SELECT s.id, s.user_id, s.bird_id, s.latitude, s.longitude, s.is_location_private, s.created_at,
                b.common_name, b.scientific_name
         FROM sightings s
         LEFT JOIN birds b ON s.bird_id = b.id
         WHERE s.is_location_private = 0
           AND s.latitude IS NOT NULL
           AND s.longitude IS NOT NULL
         ORDER BY s.created_at DESC
         LIMIT ?`,
        [limit]
      );

      return rows.map((r) => ({
        ...r,
        is_location_private: Boolean(r.is_location_private),
        bird: r.common_name
          ? { id: r.bird_id, common_name: r.common_name, scientific_name: r.scientific_name }
          : null,
      }));
    }

    const { data, error } = await supabase
      .from('sightings')
      .select(`
        id, user_id, bird_id, latitude, longitude, is_location_private, created_at,
        birds (id, common_name, scientific_name)
      `)
      .eq('is_location_private', false)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error in getForMap:', error);
      throw error;
    }

    const excludedUserIds = await getExcludedUserIds(currentUserId);
    return (data || [])
      .filter((item) => !excludedUserIds.has(item.user_id))
      .map((item) => ({
        ...item,
        bird: item.birds,
      }));
  },

  async getByUserId(userId: string, page = 0, limit = 20): Promise<any[]> {
    if (!isOnline) {
      const rows = await db.getAllAsync<any>(
        `SELECT s.*, u.username, u.fullname, u.profile_pic_url, u.is_verified,
                b.common_name, b.scientific_name
         FROM sightings s
         LEFT JOIN users u ON s.user_id = u.id
         LEFT JOIN birds b ON s.bird_id = b.id
         WHERE s.user_id = ?
         ORDER BY s.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, page * limit]
      );
      const sightingIds = rows.map((r) => r.id);

      let localReactions: any[] = [];
      let localComments: any[] = [];
      if (sightingIds.length > 0) {
        const placeholders = sightingIds.map(() => '?').join(',');
        localReactions = await db.getAllAsync<any>(
          `SELECT sighting_id, user_id FROM reactions WHERE sighting_id IN (${placeholders})`,
          ...sightingIds
        );
        localComments = await db.getAllAsync<any>(
          `SELECT id, sighting_id FROM comments WHERE sighting_id IN (${placeholders})`,
          ...sightingIds
        );
      }

      return rows.map((r) => ({
        ...r,
        photo_url: r.local_photo_path ?? r.photo_url,
        user: {
          id: r.user_id,
          username: r.username,
          fullname: r.fullname,
          profile_pic_url: r.profile_pic_url,
          is_verified: r.is_verified,
        },
        bird: r.common_name
          ? { id: r.bird_id, common_name: r.common_name, scientific_name: r.scientific_name }
          : null,
        reactions: localReactions.filter((react) => react.sighting_id === r.id),
        comments: localComments.filter((comment) => comment.sighting_id === r.id),
      }));
    }

    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('sightings')
      .select(`
        id, user_id, bird_id, description, photo_url,
        latitude, longitude, is_location_private, created_at, updated_at,
        users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
        birds (id, common_name, scientific_name),
        reactions (user_id),
        comments (id)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error in getByUserId:', error);
      throw error;
    }

    const formattedData =
      data?.map((item) => ({
        ...item,
        user: Array.isArray(item.users) ? item.users[0] : item.users,
        bird: item.birds,
        reactions: item.reactions || [],
        comments: item.comments || [],
      })) || [];

    await Promise.all(
      formattedData.map(async (item) => {
        try {
          await db.runAsync(
            `INSERT INTO sightings
              (id, user_id, bird_id, description, latitude, longitude,
               is_location_private, photo_url, created_at, updated_at, sync_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced')
             ON CONFLICT(id) DO UPDATE SET
               bird_id     = excluded.bird_id,
               photo_url   = excluded.photo_url,
               sync_status = 'synced',
               updated_at  = excluded.updated_at`,
            [
              item.id,
              item.user_id,
              item.bird_id,
              item.description,
              item.is_location_private ? null : item.latitude,
              item.is_location_private ? null : item.longitude,
              item.is_location_private ? 1 : 0,
              item.photo_url,
              item.created_at,
              item.updated_at,
            ]
          );

          if (item.bird) {
            const bird = Array.isArray(item.bird) ? item.bird[0] : item.bird;
            if (bird) {
              await db.runAsync(
                `INSERT OR REPLACE INTO birds (id, common_name, scientific_name) VALUES (?, ?, ?)`,
                [bird.id, bird.common_name, bird.scientific_name]
              );
            }
          }
          if (item.user) {
            await db.runAsync(
              `INSERT OR REPLACE INTO users (id, username, fullname, profile_pic_url, is_verified)
               VALUES (?, ?, ?, ?, ?)`,
              [
                item.user.id,
                item.user.username,
                item.user.fullname,
                item.user.profile_pic_url,
                item.user.is_verified ? 1 : 0,
              ]
            );
          }

          if (item.reactions && item.reactions.length > 0) {
            for (const react of item.reactions) {
              await db.runAsync(
                `INSERT OR IGNORE INTO reactions (user_id, sighting_id) VALUES (?, ?)`,
                [react.user_id, item.id]
              );
            }
          }

          if (item.comments && item.comments.length > 0) {
            for (const comm of item.comments) {
              await db.runAsync(
                `INSERT OR IGNORE INTO comments (id, sighting_id) VALUES (?, ?)`,
                [comm.id, item.id]
              );
            }
          }
        } catch (err) {
          console.error('Error caching item in getByUserId:', err);
        }
      })
    );

    return formattedData;
  },

  async delete(id: string): Promise<void> {
    if (!isOnline) {
      // AUD-019: Diferenciar entre cancelar un borrador pendiente nunca sincronizado vs encolar DELETE remoto
      const localRow = await db.getFirstAsync<{ sync_status: string | null }>(
        `SELECT sync_status FROM sightings WHERE id = ?`,
        [id]
      );

      // Limpiar siempre operaciones INSERT/UPDATE pendientes para este id
      await db.runAsync(
        `DELETE FROM sync_queue
         WHERE table_name = 'sightings'
           AND operation != 'DELETE'
           AND JSON_EXTRACT(payload, '$.id') = ?`,
        [id]
      );

      await db.runAsync(`DELETE FROM sightings WHERE id = ?`, [id]);

      if (!localRow || localRow.sync_status === 'synced') {
        await addToQueue('sightings', 'DELETE', { id });
      }
      return;
    }

    const { error } = await supabase.from('sightings').delete().eq('id', id);

    if (error) {
      console.error(`[delete] Error en Supabase:`, error);
      throw error;
    }

    await db.runAsync(`DELETE FROM sightings WHERE id = ?`, [id]).catch((e) => {
      console.warn(`[delete] Error borrando de SQLite (no crítico):`, e);
    });
  },
};
