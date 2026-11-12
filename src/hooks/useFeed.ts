import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { SightingRepository } from '../repositories/sighting.repository';
import { useAuth } from '../context/AuthContext';
import FeedItem, { Post } from '../components/FeedItem';
import { handleError } from '../utils/errorHandler';
import { useNewSightings } from '../context/NewSightingsContext';

const CACHE_TTL_MS = 60000;

interface FeedCache {
  posts: Post[];
  timestamp: number;
  userId?: string;
}

export function mapSightingToPost(sighting: any, currentUserObjOrId?: any): Post {
  const currentUserId = typeof currentUserObjOrId === 'string' ? currentUserObjOrId : currentUserObjOrId?.id;
  const timeDiff = Math.max(0, Date.now() - new Date(sighting.created_at).getTime());
  const minutesAgo = Math.floor(timeDiff / (1000 * 60));
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);

  let timeAgoStr = 'Hace un momento';
  if (minutesAgo > 0 && minutesAgo < 60) {
    timeAgoStr = `Hace ${minutesAgo} min`;
  } else if (hoursAgo >= 1 && hoursAgo < 24) {
    timeAgoStr = `Hace ${hoursAgo} hora${hoursAgo === 1 ? '' : 's'}`;
  } else if (daysAgo >= 1) {
    timeAgoStr = `Hace ${daysAgo} día${daysAgo === 1 ? '' : 's'}`;
  }

  const reactionsList = Array.isArray(sighting.reactions) ? sighting.reactions : [];
  const likesCount =
    typeof sighting.likes_count === 'number'
      ? sighting.likes_count
      : reactionsList.length === 1 && typeof reactionsList[0]?.count === 'number'
      ? reactionsList[0].count
      : reactionsList.length;

  const commentsListRaw = Array.isArray(sighting.comments) ? sighting.comments : [];
  const commentsCount =
    typeof sighting.comments_count === 'number'
      ? sighting.comments_count
      : commentsListRaw.length === 1 && typeof commentsListRaw[0]?.count === 'number'
      ? commentsListRaw[0].count
      : commentsListRaw.length;

  const hasLiked =
    typeof sighting.has_liked === 'boolean'
      ? sighting.has_liked
      : currentUserId
      ? reactionsList.some((r: any) => r.user_id === currentUserId)
      : false;

  // Supabase puede devolver 'users' (plural, nombre de tabla) o 'user' (singular)
  const rawUser = sighting.users || sighting.user;
  const userData = Array.isArray(rawUser) ? rawUser[0] : rawUser;

  // Resolver nombre de usuario, con fallback al current user si es dueño
  let resolvedUsername = userData?.username;
  if (!resolvedUsername && currentUserId && sighting.user_id === currentUserId && typeof currentUserObjOrId === 'object') {
    resolvedUsername = currentUserObjOrId?.user_metadata?.username || currentUserObjOrId?.email?.split('@')[0] || 'Yo';
  }
  resolvedUsername = resolvedUsername || 'Usuario';

  let resolvedAvatar = userData?.profile_pic_url;
  if (!resolvedAvatar && currentUserId && sighting.user_id === currentUserId && typeof currentUserObjOrId === 'object') {
    resolvedAvatar = currentUserObjOrId?.user_metadata?.profile_pic_url;
  }
  resolvedAvatar = resolvedAvatar || 'https://gravatar.com/avatar/?d=mp';

  let photoUrl: string | string[] = sighting.photo_url || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600';

  if (typeof photoUrl === 'string') {
    try {
      const parsed = JSON.parse(photoUrl);
      if (Array.isArray(parsed)) {
        photoUrl = parsed;
      }
    } catch {
      // Es una URL simple, no un JSON
    }
  }

  let locationText = 'Ubicación Privada';
  if (!sighting.is_location_private && sighting.latitude && sighting.longitude) {
    locationText = `${sighting.latitude.toFixed(4)}, ${sighting.longitude.toFixed(4)}`;
  }

  return {
    id: sighting.id,
    userId: sighting.user_id,
    username: resolvedUsername,
    userAvatar: resolvedAvatar,
    location: locationText,
    image: photoUrl,
    tag: sighting.bird?.common_name || 'Ave Sin Identificar',
    likes: likesCount,
    comments: commentsCount,
    caption: sighting.description || '',
    timeAgo: timeAgoStr,
    isVerified: userData?.is_verified === true,
    commentsList: [],
    hasLiked,
    createdAt: sighting.created_at,
    latitude: sighting.is_location_private ? undefined : sighting.latitude,
    longitude: sighting.is_location_private ? undefined : sighting.longitude,
  };
}

export function useFeed() {
  const { user } = useAuth();
  const { clearNewPosts } = useNewSightings();
  const cacheRef = useRef<FeedCache | null>(null);
  const requestIdRef = useRef(0);
  const prevUserIdRef = useRef<string | undefined>(user?.id);

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const loadFeed = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const currentUserId = user?.id;
    const cached = cacheRef.current;

    if (!forceRefresh && cached && cached.userId === currentUserId && (now - cached.timestamp) < CACHE_TTL_MS) {
      setPosts(cached.posts);
      return;
    }

    const requestId = ++requestIdRef.current;

    try {
      const sightings = await SightingRepository.getFeed(currentUserId);
      if (requestId !== requestIdRef.current) return;

      const mappedPosts = sightings.map((item) => mapSightingToPost(item, user));
      cacheRef.current = {
        posts: mappedPosts,
        timestamp: Date.now(),
        userId: currentUserId,
      };
      setPosts(mappedPosts);
      // Limpiar nuevos posts al recargar manualmente
      clearNewPosts();
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      handleError(error, setToast, 'Error cargando el feed');
    }
  }, [user, clearNewPosts]);

  const handlePostDeleted = useCallback(async () => {
    cacheRef.current = null;
    await loadFeed(true);
  }, [loadFeed]);

  const handleLikeToggled = useCallback((postId: string, hasLiked: boolean, newCount: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, hasLiked, likes: newCount } : p))
    );
    if (cacheRef.current && cacheRef.current.userId === user?.id) {
      cacheRef.current = {
        ...cacheRef.current,
        posts: cacheRef.current.posts.map((p) =>
          p.id === postId ? { ...p, hasLiked, likes: newCount } : p
        ),
      };
    }
  }, [user?.id]);

  const handleCommentAdded = useCallback((postId: string, newCount: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: newCount } : p))
    );
    if (cacheRef.current && cacheRef.current.userId === user?.id) {
      cacheRef.current = {
        ...cacheRef.current,
        posts: cacheRef.current.posts.map((p) =>
          p.id === postId ? { ...p, comments: newCount } : p
        ),
      };
    }
  }, [user?.id]);

  const initialLoad = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    await loadFeed(forceRefresh);
    setIsLoading(false);
  }, [loadFeed]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadFeed(true);
    setIsRefreshing(false);
  };

  // Invalidar caché y recargar cuando cambia el usuario autenticado o cierra sesión
  useEffect(() => {
    if (prevUserIdRef.current !== user?.id) {
      prevUserIdRef.current = user?.id;
      cacheRef.current = null;
      initialLoad(true);
    }
  }, [user?.id, initialLoad]);

  useEffect(() => {
    initialLoad();

    // Sincronización pasiva periódica (5 minutos = 300,000 ms) para ahorrar batería y datos
    const intervalId = setInterval(() => {
      loadFeed(true);
    }, 300000);

    // Recargar feed cuando la cola offline termina de sincronizarse
    const syncListener = DeviceEventEmitter.addListener('sync_completed', () => {
      loadFeed(true);
    });

    const refreshListener = DeviceEventEmitter.addListener('refresh_feed', () => {
      loadFeed(true);
    });

    return () => {
      clearInterval(intervalId);
      syncListener.remove();
      refreshListener.remove();
    };
  }, [initialLoad, loadFeed]);

  return {
    posts,
    isLoading,
    isRefreshing,
    toast,
    setToast,
    loadFeed,
    handlePostDeleted,
    handleLikeToggled,
    handleCommentAdded,
    onRefresh,
  };
}
