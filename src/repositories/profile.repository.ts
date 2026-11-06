import { supabase } from '../lib/supabase';
import { User, UpdateProfileDTO } from '../types/models';
import db from '../lib/database';
import { isOnline } from '../services/syncService';

export const PUBLIC_USER_COLUMNS =
  'id, username, fullname, bio, profile_pic_url, is_private, is_verified, user_level, created_at';

export interface ProfileSummary {
  profile: User | null;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  canViewContent: boolean;
}

function isMissingRpcError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '');
  const message = String(error.message || '').toLowerCase();
  const details = String(error.details || '').toLowerCase();
  const hint = String(error.hint || '').toLowerCase();

  if (code === 'PGRST202' || code === '42883') {
    return true;
  }

  return (
    message.includes('could not find the function') ||
    details.includes('could not find the function') ||
    hint.includes('could not find the function') ||
    (message.includes('get_profile_summary') && message.includes('does not exist'))
  );
}

function extractAggregatedCount(rel: any): number {
  if (typeof rel === 'number') return rel;
  if (Array.isArray(rel)) {
    if (rel.length === 1 && typeof rel[0]?.count === 'number') {
      return rel[0].count;
    }
    return rel.length;
  }
  if (rel && typeof rel.count === 'number') {
    return rel.count;
  }
  return 0;
}

export const ProfileRepository = {
  async getById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select(PUBLIC_USER_COLUMNS)
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      throw error;
    }
    return data as User;
  },

  async getProfileSummary(targetUserId: string, viewerUserId?: string): Promise<ProfileSummary> {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_profile_summary', {
      p_target_user_id: targetUserId,
    });

    if (!rpcError && rpcData) {
      return {
        profile: (rpcData.profile as User) ?? null,
        followersCount: Number(rpcData.followers_count ?? 0),
        followingCount: Number(rpcData.following_count ?? 0),
        isFollowing: Boolean(rpcData.is_following),
        canViewContent: Boolean(rpcData.can_view_content),
      };
    }

    // No ocultar errores de red, autenticación, permisos o RLS; solo caer a fallback si la RPC no existe
    if (rpcError && !isMissingRpcError(rpcError)) {
      throw rpcError;
    }

    const isMe = Boolean(viewerUserId && viewerUserId === targetUserId);

    const [
      profileData,
      followersCountRes,
      followingCountRes,
      viewerFollowsRes,
      targetFollowsRes,
    ] = await Promise.all([
      this.getById(targetUserId),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetUserId),
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetUserId),
      !isMe && viewerUserId
        ? supabase
            .from('follows')
            .select('follower_id')
            .eq('follower_id', viewerUserId)
            .eq('following_id', targetUserId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      !isMe && viewerUserId
        ? supabase
            .from('follows')
            .select('follower_id')
            .eq('follower_id', targetUserId)
            .eq('following_id', viewerUserId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (followersCountRes.error) throw followersCountRes.error;
    if (followingCountRes.error) throw followingCountRes.error;
    if (viewerFollowsRes.error) throw viewerFollowsRes.error;
    if (targetFollowsRes.error) throw targetFollowsRes.error;

    const isFollowing = Boolean(viewerFollowsRes.data);
    let canViewContent = false;
    if (profileData) {
      if (isMe || !profileData.is_private) {
        canViewContent = true;
      } else if (viewerUserId) {
        canViewContent = Boolean(viewerFollowsRes.data && targetFollowsRes.data);
      }
    }

    return {
      profile: profileData,
      followersCount: followersCountRes.count ?? 0,
      followingCount: followingCountRes.count ?? 0,
      isFollowing,
      canViewContent,
    };
  },

  async getProfileSightings(
    targetUserId: string,
    viewerUserId?: string,
    page = 0,
    limit = 30
  ): Promise<{ items: any[]; hasMore: boolean }> {
    const from = page * limit;
    const to = from + limit - 1;

    const { data: sightingsData, error: sightingsError } = await supabase
      .from('sightings')
      .select(`
        id,
        user_id,
        bird_id,
        description,
        photo_url,
        latitude,
        longitude,
        sighting_date,
        is_location_private,
        created_at,
        users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
        bird:birds (id, common_name, scientific_name),
        reactions (count),
        comments (count)
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (sightingsError) throw sightingsError;

    const rows = sightingsData || [];
    const sightingIds = rows.map((r: any) => r.id).filter(Boolean);

    const likedSet = new Set<string>();
    if (viewerUserId && sightingIds.length > 0) {
      const { data: myReactions, error: myReactionsError } = await supabase
        .from('reactions')
        .select('sighting_id')
        .eq('user_id', viewerUserId)
        .in('sighting_id', sightingIds);

      if (myReactionsError) throw myReactionsError;
      for (const r of myReactions || []) {
        if (r?.sighting_id) likedSet.add(r.sighting_id);
      }
    }

    const items = rows.map((item: any) => ({
      ...item,
      likes_count: extractAggregatedCount(item.reactions),
      comments_count: extractAggregatedCount(item.comments),
      has_liked: likedSet.has(item.id),
    }));

    return {
      items,
      hasMore: rows.length === limit,
    };
  },

  async getLikedSightings(
    targetUserId: string,
    viewerUserId?: string,
    page = 0,
    limit = 30
  ): Promise<{ items: any[]; hasMore: boolean }> {
    const from = page * limit;
    const to = from + limit - 1;

    const { data: reactionsData, error: reactionsError } = await supabase
      .from('reactions')
      .select(`
        created_at,
        sighting:sightings (
          id,
          user_id,
          bird_id,
          description,
          photo_url,
          latitude,
          longitude,
          sighting_date,
          is_location_private,
          created_at,
          users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
          bird:birds (id, common_name, scientific_name),
          reactions (count),
          comments (count)
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (reactionsError) throw reactionsError;

    const rawRows = reactionsData || [];
    const rawSightings = rawRows
      .map((r: any) => r?.sighting)
      .filter((s: any): s is Record<string, any> => Boolean(s && s.id));

    const likedByViewerSet = new Set<string>();
    if (viewerUserId && rawSightings.length > 0) {
      if (viewerUserId === targetUserId) {
        for (const s of rawSightings) {
          likedByViewerSet.add(s.id);
        }
      } else {
        const sightingIds = rawSightings.map((s) => s.id);
        const { data: myReactions, error: myReactionsError } = await supabase
          .from('reactions')
          .select('sighting_id')
          .eq('user_id', viewerUserId)
          .in('sighting_id', sightingIds);

        if (myReactionsError) throw myReactionsError;
        for (const r of myReactions || []) {
          if (r?.sighting_id) likedByViewerSet.add(r.sighting_id);
        }
      }
    }

    const items = rawSightings.map((item: any) => ({
      ...item,
      likes_count: extractAggregatedCount(item.reactions),
      comments_count: extractAggregatedCount(item.comments),
      has_liked: likedByViewerSet.has(item.id),
    }));

    return {
      items,
      hasMore: rawRows.length === limit,
    };
  },

  async update(userId: string, payload: UpdateProfileDTO): Promise<User> {
    const { is_verified: _iv, user_level: _ul, ...safePayload } = payload as Record<string, unknown>;
    const { data, error } = await supabase
      .from('users')
      .update(safePayload)
      .eq('id', userId)
      .select(PUBLIC_USER_COLUMNS)
      .single();

    if (error) throw error;
    return data as User;
  },

  async getAll(): Promise<any[]> {
    if (!isOnline) {
      try {
        const rows = await db.getAllAsync<any>(
          `SELECT id, username, fullname, bio, profile_pic_url, is_verified FROM users ORDER BY username ASC`
        );
        return rows || [];
      } catch {
        return [];
      }
    }
    const { data, error } = await supabase
      .from('users')
      .select('id, username, fullname, bio, profile_pic_url, is_verified')
      .order('username');

    if (error) throw error;
    return data || [];
  }
};
