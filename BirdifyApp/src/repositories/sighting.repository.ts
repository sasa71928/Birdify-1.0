import { supabase } from '../lib/supabase';
import { Sighting } from '../types/models';
import db from '../lib/database';
import { isOnline, addToQueue, generateId } from '../services/syncService';

export const SightingRepository = {

  async create(sighting: Omit<Sighting, 'id' | 'created_at' | 'updated_at'>): Promise<Sighting> {
    if (isOnline) {
      const { data, error } = await supabase
        .from('sightings')
        .insert(sighting)
        .select()
        .single();

      if (error) throw error;

      await db.runAsync(
        `INSERT OR REPLACE INTO sightings
         (id, user_id, bird_id, description, latitude, longitude, is_location_private, photo_url, sighting_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.id, data.user_id, data.bird_id ?? null, data.description ?? null,
         data.latitude ?? null, data.longitude ?? null,
         data.is_location_private ? 1 : 0, data.photo_url ?? null,
         data.sighting_date ?? null, data.created_at ?? null]
      );

      return data;
    } else {
      const id = generateId();
      const now = new Date().toISOString();
      const localSighting = { ...sighting, id, created_at: now, updated_at: now };

      await db.runAsync(
        `INSERT OR REPLACE INTO sightings
         (id, user_id, bird_id, description, latitude, longitude, is_location_private, photo_url, sighting_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, sighting.user_id, sighting.bird_id ?? null, sighting.description ?? null,
         sighting.latitude ?? null, sighting.longitude ?? null,
         sighting.is_location_private ? 1 : 0, sighting.photo_url ?? null,
         sighting.sighting_date ?? null, now]
      );

      await addToQueue('sightings', 'INSERT', localSighting);
      console.log('Avistamiento guardado offline, se sincronizará cuando haya red.');

      return localSighting as Sighting;
    }
  },

  async getFeed(): Promise<any[]> {
    if (isOnline) {
      const { data, error } = await supabase
        .from('sightings')
        .select(`
          *,
          users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
          birds (id, common_name, scientific_name),
          reactions (user_id),
          comments (id)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error in getFeed:', error);
        throw error;
      }

      const formattedData = data?.map(item => ({
        ...item,
        user: item.users,
        bird: item.birds,
        reactions: item.reactions || [],
        comments: item.comments || []
      }));

      // Cachea sightings, usuarios y aves localmente
      for (const item of data ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO sightings
           (id, user_id, bird_id, description, latitude, longitude, is_location_private, photo_url, sighting_date, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [item.id, item.user_id, item.bird_id ?? null, item.description ?? null,
           item.latitude ?? null, item.longitude ?? null,
           item.is_location_private ? 1 : 0, item.photo_url ?? null,
           item.sighting_date ?? null, item.created_at ?? null]
        );

        if (item.users) {
          await db.runAsync(
            `INSERT OR REPLACE INTO users
             (id, username, fullname, profile_pic_url, is_verified)
             VALUES (?, ?, ?, ?, ?)`,
            [item.users.id, item.users.username ?? null,
             item.users.fullname ?? null, item.users.profile_pic_url ?? null,
             item.users.is_verified ? 1 : 0]
          );
        }

        if (item.birds) {
          await db.runAsync(
            `INSERT OR REPLACE INTO birds
             (id, common_name, scientific_name)
             VALUES (?, ?, ?)`,
            [item.birds.id, item.birds.common_name ?? null,
             item.birds.scientific_name ?? null]
          );
        }
      }

      return formattedData || [];
    } else {
      const rows = await db.getAllAsync<any>(`
        SELECT s.*, u.username, u.fullname, u.profile_pic_url, u.is_verified,
               b.common_name, b.scientific_name
        FROM sightings s
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN birds b ON s.bird_id = b.id
        ORDER BY s.created_at DESC
      `);

      return rows.map(row => ({
        ...row,
        user: {
          id: row.user_id,
          username: row.username,
          fullname: row.fullname,
          profile_pic_url: row.profile_pic_url,
          is_verified: !!row.is_verified
        },
        bird: {
          id: row.bird_id,
          common_name: row.common_name,
          scientific_name: row.scientific_name
        },
        reactions: [],
        comments: []
      }));
    }
  },

  async getByUserId(userId: string): Promise<any[]> {
    if (isOnline) {
      const { data, error } = await supabase
        .from('sightings')
        .select(`
          *,
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

      // Cachea sightings, usuarios y aves localmente
      for (const item of data ?? []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO sightings
           (id, user_id, bird_id, description, latitude, longitude, is_location_private, photo_url, sighting_date, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [item.id, item.user_id, item.bird_id ?? null, item.description ?? null,
           item.latitude ?? null, item.longitude ?? null,
           item.is_location_private ? 1 : 0, item.photo_url ?? null,
           item.sighting_date ?? null, item.created_at ?? null]
        );

        if (item.users) {
          await db.runAsync(
            `INSERT OR REPLACE INTO users
             (id, username, fullname, profile_pic_url, is_verified)
             VALUES (?, ?, ?, ?, ?)`,
            [item.users.id, item.users.username ?? null,
             item.users.fullname ?? null, item.users.profile_pic_url ?? null,
             item.users.is_verified ? 1 : 0]
          );
        }

        if (item.birds) {
          await db.runAsync(
            `INSERT OR REPLACE INTO birds
             (id, common_name, scientific_name)
             VALUES (?, ?, ?)`,
            [item.birds.id, item.birds.common_name ?? null,
             item.birds.scientific_name ?? null]
          );
        }
      }

      return formattedData || [];
    } else {
      const rows = await db.getAllAsync<any>(`
        SELECT s.*, u.username, u.fullname, u.profile_pic_url, u.is_verified,
               b.common_name, b.scientific_name
        FROM sightings s
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN birds b ON s.bird_id = b.id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
      `, [userId]);

      return rows.map(row => ({
        ...row,
        user: {
          id: row.user_id,
          username: row.username,
          fullname: row.fullname,
          profile_pic_url: row.profile_pic_url,
          is_verified: !!row.is_verified
        },
        bird: {
          id: row.bird_id,
          common_name: row.common_name,
          scientific_name: row.scientific_name
        },
        reactions: [],
        comments: []
      }));
    }
  }
};