import { supabase } from '../lib/supabase';
import { Sighting } from '../types/models';
import { PushNotificationSender } from '../services/push.sender';
import { NotificationPreferencesService } from '../services/notification.preferences';
import db from '../lib/database';
import { isOnline, addToQueue, generateId } from '../services/syncService';

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
          localRecord.latitude ?? null,
          localRecord.longitude ?? null,
          localRecord.is_location_private ? 1 : 0,
          localRecord.photo_url ?? null,
          (sighting as any)._localImagePath ?? null,
          localRecord.created_at,
          localRecord.updated_at,
          'pending',
        ]
      );

      // Guardar ave local para que el JOIN funcione offline
      if ((sighting as any)._birdName && localRecord.bird_id) {
        await db.runAsync(
          `INSERT OR REPLACE INTO birds (id, common_name, scientific_name) VALUES (?, ?, ?)`,
          [
            localRecord.bird_id,
            (sighting as any)._birdName,
            (sighting as any)._scientificName ?? (sighting as any)._birdName + ' sp.',
          ]
        ).catch(() => {});
      }

      const queuePayload: any = { ...sighting, id: localId };
      if ((sighting as any)._localImagePath) {
        queuePayload._localImagePath = (sighting as any)._localImagePath;
        queuePayload._birdName = (sighting as any)._birdName;
        queuePayload._scientificName = (sighting as any)._scientificName;
      }
      await addToQueue('sightings', 'INSERT', queuePayload);

      return localRecord as Sighting;
    }

    // ── MODO ONLINE (flujo original) ──────────────────────────────────────────
    const { _localImagePath, _birdName, _scientificName, ...cleanSighting } = sighting as any;

    const { data, error } = await supabase
      .from('sightings')
      .insert(cleanSighting)
      .select()
      .single();

    if (error) throw error;

    this.notifyFollowers(sighting.user_id, data.id).catch(() => {});

    // Cachear sighting — conserva local_photo_path si ya existe
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
        data.id, data.user_id, data.bird_id, data.description,
        data.latitude, data.longitude, data.is_location_private ? 1 : 0,
        data.photo_url,
        (sighting as any)._localImagePath ?? null,
        data.created_at, data.updated_at,
      ]
    ).catch(() => {});

    // Cachear ave para que el JOIN funcione offline
    if ((sighting as any)._birdName && data.bird_id) {
      db.runAsync(
        `INSERT OR REPLACE INTO birds (id, common_name, scientific_name) VALUES (?, ?, ?)`,
        [
          data.bird_id,
          (sighting as any)._birdName,
          (sighting as any)._scientificName ?? (sighting as any)._birdName + ' sp.',
        ]
      ).catch(() => {});
    }

    return data;
  },

  async notifyFollowers(userId: string, sightingId: string): Promise<void> {
    try {
      const { data: followers } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);

      if (!followers || followers.length === 0) return;

      const followerIds = followers.map((f: any) => f.follower_id);
      const enabledIds: string[] = [];

      for (const fid of followerIds) {
        const enabled = await NotificationPreferencesService.isPushEnabled(fid, 'new_sighting');
        if (enabled) enabledIds.push(fid);
      }

      if (enabledIds.length === 0) return;

      const { data: user } = await supabase
        .from('users')
        .select('username, fullname')
        .eq('id', userId)
        .single();

      const name = user?.fullname || user?.username || 'Alguien';

      await PushNotificationSender.sendToUsers(enabledIds, {
        title: 'Nuevo avistamiento',
        body: `${name} publicó un nuevo avistamiento`,
        data: { type: 'new_sighting', sightingId },
      });
    } catch (e) {
      console.error('Error notifying followers:', e);
    }
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

  async getFeed(currentUserId?: string, page = 0, limit = 20): Promise<any[]> {
    // ── OFFLINE: devolver caché local ──────────────────────────────────────────
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
      return rows.map(r => ({
        ...r,
        // Prefiere path local para imagen
        photo_url: r.local_photo_path ?? r.photo_url,
        user: { id: r.user_id, username: r.username, fullname: r.fullname, profile_pic_url: r.profile_pic_url, is_verified: r.is_verified },
        bird: r.common_name ? { id: r.bird_id, common_name: r.common_name, scientific_name: r.scientific_name } : null,
        reactions: [],
        comments: [],
      }));
    }

    // ── ONLINE: flujo original ─────────────────────────────────────────────────
    const from = page * limit;
    const to = from + limit - 1;

    let query = supabase
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

    const { data, error } = await query;

    if (error) {
      console.error('Error in getFeed:', error);
      throw error;
    }

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

    const formattedData = filteredData.map(item => ({
      ...item,
      user: Array.isArray(item.users) ? item.users[0] : item.users,
      bird: item.birds,
      reactions: item.reactions || [],
      comments: item.comments || [],
    }));

    // Cachear en SQLite — sin pisar local_photo_path ni birds locales
    for (const item of formattedData) {
      db.runAsync(
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
          item.id, item.user_id, item.bird_id, item.description,
          item.latitude, item.longitude, item.is_location_private ? 1 : 0,
          item.photo_url, item.created_at, item.updated_at,
        ]
      ).catch(() => {});

        // Cachear ave para que el JOIN funcione offline
        if (item.bird) {
          const bird = Array.isArray(item.bird) ? item.bird[0] : item.bird;
          if (bird) {
            db.runAsync(
              `INSERT OR REPLACE INTO birds (id, common_name, scientific_name) VALUES (?, ?, ?)`,
              [bird.id, bird.common_name, bird.scientific_name]
            ).catch(() => {});
          }
        }
      if (item.user) {
        db.runAsync(
          `INSERT OR REPLACE INTO users (id, username, fullname, profile_pic_url, is_verified)
           VALUES (?, ?, ?, ?, ?)`,
          [item.user.id, item.user.username, item.user.fullname, item.user.profile_pic_url, item.user.is_verified ? 1 : 0]
        ).catch(() => {});
      }
    }

    return formattedData;
  },

  async getByUserId(userId: string, page = 0, limit = 20): Promise<any[]> {
    // ── OFFLINE: devolver caché local del usuario ──────────────────────────────
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
      return rows.map(r => ({
        ...r,
        photo_url: r.local_photo_path ?? r.photo_url,
        user: { id: r.user_id, username: r.username, fullname: r.fullname, profile_pic_url: r.profile_pic_url, is_verified: r.is_verified },
        bird: r.common_name ? { id: r.bird_id, common_name: r.common_name, scientific_name: r.scientific_name } : null,
        reactions: [],
        comments: [],
      }));
    }

    // ── ONLINE: flujo original ─────────────────────────────────────────────────
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

    const formattedData = data?.map(item => ({
      ...item,
      user: item.users,
      bird: item.birds,
      reactions: item.reactions || [],
      comments: item.comments || [],
    }));

    return formattedData || [];
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sightings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};