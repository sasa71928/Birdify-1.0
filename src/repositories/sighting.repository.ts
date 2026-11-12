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

function extractAggregatedCount(relation: any): number {
  if (typeof relation === 'number') return relation;
  if (Array.isArray(relation)) {
    if (relation.length === 0) return 0;
    if (typeof relation[0]?.count === 'number') {
      return relation[0].count;
    }
    return relation.length;
  }
  if (relation && typeof relation.count === 'number') {
    return relation.count;
  }
  return 0;
}

async function fetchUserLikedSightingIds(
  sightingIds: string[],
  currentUserId?: string
): Promise<Set<string>> {
  const likedSightingIds = new Set<string>();
  if (!currentUserId || sightingIds.length === 0) {
    return likedSightingIds;
  }

  const { data: myReactions, error: myReactionsError } = await supabase
    .from('reactions')
    .select('sighting_id')
    .eq('user_id', currentUserId)
    .in('sighting_id', sightingIds);

  if (myReactionsError) {
    console.warn('[SightingRepository] Error consultando reacciones propias:', myReactionsError);
    return likedSightingIds;
  }

  for (const row of myReactions || []) {
    if (row?.sighting_id) {
      likedSightingIds.add(row.sighting_id);
    }
  }
  return likedSightingIds;
}

async function fetchLocalLikedSightingIds(
  sightingIds: string[],
  currentUserId?: string
): Promise<Set<string>> {
  const likedSightingIds = new Set<string>();
  if (!currentUserId || sightingIds.length === 0) {
    return likedSightingIds;
  }

  const placeholders = sightingIds.map(() => '?').join(',');
  const rows = await db.getAllAsync<{ sighting_id: string }>(
    `SELECT sighting_id FROM reactions WHERE user_id = ? AND sighting_id IN (${placeholders})`,
    [currentUserId, ...sightingIds]
  );

  for (const row of rows) {
    if (row?.sighting_id) {
      likedSightingIds.add(row.sighting_id);
    }
  }
  return likedSightingIds;
}

interface PendingSyncAdjustments {
  pendingReactionBySighting: Map<string, 'INSERT' | 'DELETE_REACTION'>;
  pendingCommentsCountBySighting: Map<string, number>;
}

async function getPendingSyncAdjustments(
  sightingIds: string[],
  currentUserId?: string
): Promise<PendingSyncAdjustments> {
  const pendingReactionBySighting = new Map<string, 'INSERT' | 'DELETE_REACTION'>();
  const pendingCommentsCountBySighting = new Map<string, number>();

  if (sightingIds.length === 0) {
    return { pendingReactionBySighting, pendingCommentsCountBySighting };
  }

  try {
    const targetIds = new Set(sightingIds);
    const queueRows = await db.getAllAsync<{
      table_name: string;
      operation: string;
      payload: string;
    }>(
      `SELECT table_name, operation, payload
       FROM sync_queue
       WHERE table_name IN ('reactions', 'comments')
       ORDER BY created_at ASC`
    );

    for (const row of queueRows) {
      try {
        const parsed = JSON.parse(row.payload);
        const sightingId = parsed?.sighting_id;
        if (!sightingId || !targetIds.has(sightingId)) continue;

        if (
          row.table_name === 'reactions' &&
          currentUserId &&
          parsed?.user_id === currentUserId &&
          (row.operation === 'INSERT' || row.operation === 'DELETE_REACTION')
        ) {
          pendingReactionBySighting.set(sightingId, row.operation);
        } else if (row.table_name === 'comments' && row.operation === 'INSERT') {
          pendingCommentsCountBySighting.set(
            sightingId,
            (pendingCommentsCountBySighting.get(sightingId) || 0) + 1
          );
        }
      } catch {
        // Ignorar payload malformado en cola local
      }
    }
  } catch (e) {
    console.warn('[SightingRepository] Error leyendo sync_queue local:', e);
  }

  return { pendingReactionBySighting, pendingCommentsCountBySighting };
}

function resolveOnlineSightingCounts(
  item: any,
  likedSightingIds: Set<string>,
  adjustments: PendingSyncAdjustments,
  currentUserId?: string
) {
  const remoteLikesCount = extractAggregatedCount(item.reactions);
  const remoteCommentsCount = extractAggregatedCount(item.comments);
  const remoteHasLiked = likedSightingIds.has(item.id);
  const pendingReactionOp = adjustments.pendingReactionBySighting.get(item.id);

  let hasLiked = remoteHasLiked;
  let likesCount = remoteLikesCount;

  if (pendingReactionOp === 'INSERT') {
    hasLiked = true;
    if (!remoteHasLiked) {
      likesCount = remoteLikesCount + 1;
    }
  } else if (pendingReactionOp === 'DELETE_REACTION') {
    hasLiked = false;
    if (remoteHasLiked) {
      likesCount = Math.max(0, remoteLikesCount - 1);
    }
  }

  const pendingComments = adjustments.pendingCommentsCountBySighting.get(item.id) || 0;
  const commentsCount = remoteCommentsCount + pendingComments;

  return {
    likes_count: likesCount,
    comments_count: commentsCount,
    has_liked: hasLiked,
    reactions: hasLiked && currentUserId ? [{ user_id: currentUserId }] : [],
    comments: [],
  };
}

async function syncLocalUserReaction(
  sightingId: string,
  hasLiked: boolean,
  adjustments: PendingSyncAdjustments,
  currentUserId?: string
): Promise<void> {
  if (!currentUserId || adjustments.pendingReactionBySighting.has(sightingId)) {
    return;
  }

  if (hasLiked) {
    await db.runAsync(
      `INSERT OR IGNORE INTO reactions (user_id, sighting_id) VALUES (?, ?)`,
      [currentUserId, sightingId]
    );
  } else {
    await db.runAsync(
      `DELETE FROM reactions WHERE user_id = ? AND sighting_id = ?`,
      [currentUserId, sightingId]
    );
  }
}

async function refreshExistingSqliteCounts(
  items: Array<{ id: string; likes_count: number; comments_count: number; has_liked: boolean }>,
  adjustments: PendingSyncAdjustments,
  currentUserId?: string
): Promise<void> {
  if (items.length === 0) return;

  await Promise.all(
    items.map(async (item) => {
      try {
        await db.runAsync(
          `UPDATE sightings SET likes_count = ?, comments_count = ? WHERE id = ?`,
          [item.likes_count, item.comments_count, item.id]
        );
        await syncLocalUserReaction(item.id, item.has_liked, adjustments, currentUserId);
      } catch {
        // Non-blocking SQLite cache refresh
      }
    })
  );
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
      const likedSightingIds = await fetchLocalLikedSightingIds(sightingIds, currentUserId);

      return rows.map((r) => {
        const hasLiked = likedSightingIds.has(r.id);
        const likesCount = Math.max(Number(r.likes_count ?? 0), hasLiked ? 1 : 0);
        const commentsCount = Math.max(0, Number(r.comments_count ?? 0));

        return {
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
          likes_count: likesCount,
          comments_count: commentsCount,
          has_liked: hasLiked,
          reactions: hasLiked && currentUserId ? [{ user_id: currentUserId }] : [],
          comments: [],
        };
      });
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
        reactions (count),
        comments (count)
      `)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error in getFeed:', error);
      throw error;
    }

    const excludedUserIds = await getExcludedUserIds(currentUserId);
    const filteredData = (data || []).filter((item) => !excludedUserIds.has(item.user_id));

    const sightingIds = filteredData.map((item) => item.id);
    const [likedSightingIds, adjustments] = await Promise.all([
      fetchUserLikedSightingIds(sightingIds, currentUserId),
      getPendingSyncAdjustments(sightingIds, currentUserId),
    ]);

    const formattedData = filteredData.map((item) => {
      const countsAndLike = resolveOnlineSightingCounts(
        item,
        likedSightingIds,
        adjustments,
        currentUserId
      );

      return {
        ...item,
        user: Array.isArray(item.users) ? item.users[0] : item.users,
        bird: item.birds,
        ...countsAndLike,
      };
    });

    await Promise.all(
      formattedData.map(async (item) => {
        try {
          await db.runAsync(
            `INSERT INTO sightings
              (id, user_id, bird_id, description, latitude, longitude,
               is_location_private, photo_url, likes_count, comments_count,
               created_at, updated_at, sync_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced')
             ON CONFLICT(id) DO UPDATE SET
               bird_id        = CASE WHEN sightings.sync_status = 'synced' THEN excluded.bird_id ELSE sightings.bird_id END,
               photo_url      = CASE WHEN sightings.sync_status = 'synced' THEN excluded.photo_url ELSE sightings.photo_url END,
               likes_count    = excluded.likes_count,
               comments_count = excluded.comments_count,
               sync_status    = CASE WHEN sightings.sync_status = 'synced' THEN 'synced' ELSE sightings.sync_status END,
               updated_at     = CASE WHEN sightings.sync_status = 'synced' THEN excluded.updated_at ELSE sightings.updated_at END`,
            [
              item.id,
              item.user_id,
              item.bird_id,
              item.description,
              item.is_location_private ? null : item.latitude,
              item.is_location_private ? null : item.longitude,
              item.is_location_private ? 1 : 0,
              item.photo_url,
              item.likes_count,
              item.comments_count,
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

          await syncLocalUserReaction(item.id, item.has_liked, adjustments, currentUserId);
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

      const sightingIds = rows.map((r) => r.id);
      const likedSightingIds = await fetchLocalLikedSightingIds(sightingIds, currentUserId);

      return rows.map((r) => {
        const hasLiked = likedSightingIds.has(r.id);
        const likesCount = Math.max(Number(r.likes_count ?? 0), hasLiked ? 1 : 0);
        const commentsCount = Math.max(0, Number(r.comments_count ?? 0));

        return {
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
          likes_count: likesCount,
          comments_count: commentsCount,
          has_liked: hasLiked,
          reactions: hasLiked && currentUserId ? [{ user_id: currentUserId }] : [],
          comments: [],
        };
      });
    }

    const { data, error } = await supabase
      .from('sightings')
      .select(`
        id, user_id, bird_id, description, photo_url,
        latitude, longitude, is_location_private, created_at, updated_at,
        users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
        birds (id, common_name, scientific_name),
        reactions (count),
        comments (count)
      `)
      .eq('bird_id', birdId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error in getByBirdId:', error);
      throw error;
    }

    const excludedUserIds = await getExcludedUserIds(currentUserId);
    const filteredData = (data || []).filter((item) => !excludedUserIds.has(item.user_id));

    const sightingIds = filteredData.map((item) => item.id);
    const [likedSightingIds, adjustments] = await Promise.all([
      fetchUserLikedSightingIds(sightingIds, currentUserId),
      getPendingSyncAdjustments(sightingIds, currentUserId),
    ]);

    const formattedData = filteredData.map((item) => {
      const countsAndLike = resolveOnlineSightingCounts(
        item,
        likedSightingIds,
        adjustments,
        currentUserId
      );

      return {
        ...item,
        user: Array.isArray(item.users) ? item.users[0] : item.users,
        bird: item.birds,
        ...countsAndLike,
      };
    });

    await refreshExistingSqliteCounts(formattedData, adjustments, currentUserId);
    return formattedData;
  },

  /**
   * Consulta marcadores geográficos públicos dedicados para el mapa Explore (AUD-020),
   * filtrando ubicaciones privadas y usuarios bloqueados sin truncar a 20 registros.
   */
  async getForMap(currentUserId?: string, limit = 200): Promise<any[]> {
    if (!isOnline) {
      const rows = await db.getAllAsync<any>(
        `SELECT s.id, s.user_id, s.bird_id, s.description, s.photo_url, s.local_photo_path,
                s.latitude, s.longitude, s.is_location_private, s.created_at,
                s.likes_count, s.comments_count,
                b.common_name, b.scientific_name,
                u.username, u.fullname, u.profile_pic_url, u.is_verified
         FROM sightings s
         LEFT JOIN birds b ON s.bird_id = b.id
         LEFT JOIN users u ON s.user_id = u.id
         WHERE s.is_location_private = 0
           AND s.latitude IS NOT NULL
           AND s.longitude IS NOT NULL
         ORDER BY s.created_at DESC
         LIMIT ?`,
        [limit]
      );

      const sightingIds = rows.map((r) => r.id);
      const likedSightingIds = await fetchLocalLikedSightingIds(sightingIds, currentUserId);

      return rows.map((r) => {
        const hasLiked = likedSightingIds.has(r.id);
        const likesCount = Math.max(Number(r.likes_count ?? 0), hasLiked ? 1 : 0);
        const commentsCount = Math.max(0, Number(r.comments_count ?? 0));

        return {
          ...r,
          is_location_private: Boolean(r.is_location_private),
          user: r.username
            ? {
                id: r.user_id,
                username: r.username,
                fullname: r.fullname,
                profile_pic_url: r.profile_pic_url,
                is_verified: Boolean(r.is_verified),
              }
            : null,
          bird: r.common_name
            ? {
                id: r.bird_id,
                common_name: r.common_name,
                scientific_name: r.scientific_name,
                image_url: r.photo_url || r.local_photo_path,
              }
            : {
                id: r.bird_id || r.id,
                common_name: 'Ave observada',
                scientific_name: 'Especie silvestre',
                image_url: r.photo_url || r.local_photo_path,
              },
          likes_count: likesCount,
          comments_count: commentsCount,
          has_liked: hasLiked,
          reactions: hasLiked && currentUserId ? [{ user_id: currentUserId }] : [],
          comments: [],
        };
      });
    }

    const { data, error } = await supabase
      .from('sightings')
      .select(`
        id, user_id, bird_id, description, photo_url, latitude, longitude, is_location_private, created_at,
        users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
        birds!sightings_bird_id_fkey (id, common_name, scientific_name, season, habitat_info, description),
        reactions (count),
        comments (count)
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
    const filteredData = (data || []).filter((item) => !excludedUserIds.has(item.user_id));

    const sightingIds = filteredData.map((item) => item.id);
    const [likedSightingIds, adjustments] = await Promise.all([
      fetchUserLikedSightingIds(sightingIds, currentUserId),
      getPendingSyncAdjustments(sightingIds, currentUserId),
    ]);

    const formattedData = filteredData.map((item) => {
      const rawBird = Array.isArray(item.birds) ? item.birds[0] : item.birds;
      const rawUser = Array.isArray(item.users) ? item.users[0] : item.users;
      const countsAndLike = resolveOnlineSightingCounts(
        item,
        likedSightingIds,
        adjustments,
        currentUserId
      );

      return {
        ...item,
        user: rawUser || null,
        bird: rawBird
          ? {
              ...rawBird,
              image_url: item.photo_url,
            }
          : {
              id: item.bird_id || item.id,
              common_name: 'Ave observada',
              scientific_name: 'Especie silvestre',
              image_url: item.photo_url,
            },
        ...countsAndLike,
      };
    });

    await refreshExistingSqliteCounts(formattedData, adjustments, currentUserId);
    return formattedData;
  },

  async getByUserId(userId: string, page = 0, limit = 20, currentUserId?: string): Promise<any[]> {
    const viewerId = currentUserId ?? userId;
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
      const likedSightingIds = await fetchLocalLikedSightingIds(sightingIds, viewerId);

      return rows.map((r) => {
        const hasLiked = likedSightingIds.has(r.id);
        const likesCount = Math.max(Number(r.likes_count ?? 0), hasLiked ? 1 : 0);
        const commentsCount = Math.max(0, Number(r.comments_count ?? 0));

        return {
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
          likes_count: likesCount,
          comments_count: commentsCount,
          has_liked: hasLiked,
          reactions: hasLiked && viewerId ? [{ user_id: viewerId }] : [],
          comments: [],
        };
      });
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
        reactions (count),
        comments (count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error in getByUserId:', error);
      throw error;
    }

    const rawRows = data || [];
    const sightingIds = rawRows.map((item) => item.id);
    const [likedSightingIds, adjustments] = await Promise.all([
      fetchUserLikedSightingIds(sightingIds, viewerId),
      getPendingSyncAdjustments(sightingIds, viewerId),
    ]);

    const formattedData = rawRows.map((item) => {
      const countsAndLike = resolveOnlineSightingCounts(
        item,
        likedSightingIds,
        adjustments,
        viewerId
      );

      return {
        ...item,
        user: Array.isArray(item.users) ? item.users[0] : item.users,
        bird: item.birds,
        ...countsAndLike,
      };
    });

    await Promise.all(
      formattedData.map(async (item) => {
        try {
          await db.runAsync(
            `INSERT INTO sightings
              (id, user_id, bird_id, description, latitude, longitude,
               is_location_private, photo_url, likes_count, comments_count,
               created_at, updated_at, sync_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced')
             ON CONFLICT(id) DO UPDATE SET
               bird_id        = CASE WHEN sightings.sync_status = 'synced' THEN excluded.bird_id ELSE sightings.bird_id END,
               photo_url      = CASE WHEN sightings.sync_status = 'synced' THEN excluded.photo_url ELSE sightings.photo_url END,
               likes_count    = excluded.likes_count,
               comments_count = excluded.comments_count,
               sync_status    = CASE WHEN sightings.sync_status = 'synced' THEN 'synced' ELSE sightings.sync_status END,
               updated_at     = CASE WHEN sightings.sync_status = 'synced' THEN excluded.updated_at ELSE sightings.updated_at END`,
            [
              item.id,
              item.user_id,
              item.bird_id,
              item.description,
              item.is_location_private ? null : item.latitude,
              item.is_location_private ? null : item.longitude,
              item.is_location_private ? 1 : 0,
              item.photo_url,
              item.likes_count,
              item.comments_count,
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

          await syncLocalUserReaction(item.id, item.has_liked, adjustments, viewerId);
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
