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

export function mapSightingToPost(sighting: any, currentUserId?: string): Post {
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

  const reactionsList = sighting.reactions || [];
  const likesCount = reactionsList.length;
  const hasLiked = currentUserId ? reactionsList.some((r: any) => r.user_id === currentUserId) : false;

  // Supabase puede devolver 'users' (plural, nombre de tabla) o 'user' (singular)
  const rawUser = sighting.users || sighting.user;
  const userData = Array.isArray(rawUser) ? rawUser[0] : rawUser;

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
    username: userData?.username || 'Usuario',
    userAvatar: userData?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
    location: locationText,
    image: photoUrl,
    tag: sighting.bird?.common_name || 'Ave Sin Identificar',
    likes: likesCount,
    comments: sighting.comments ? sighting.comments.length : 0,
    caption: sighting.description || '',
    timeAgo: timeAgoStr,
    isVerified: userData?.is_verified === true,
    commentsList: [],
    hasLiked,
    createdAt: sighting.created_at,
    latitude: sighting.latitude,
    longitude: sighting.longitude,
  };
}

export function useFeed() {
  const { user } = useAuth();
  const { clearNewPosts } = useNewSightings();
  const cacheRef = useRef<FeedCache | null>(null);
  
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
    const cached = cacheRef.current;

    if (!forceRefresh && cached && cached.userId === user?.id && (now - cached.timestamp) < CACHE_TTL_MS) {
      setPosts(cached.posts);
      return;
    }

    try {
      const sightings = await SightingRepository.getFeed(user?.id);
      const mappedPosts = sightings.map(item => mapSightingToPost(item, user?.id));
      cacheRef.current = { posts: mappedPosts, timestamp: now, userId: user?.id };
      setPosts(mappedPosts);
      // Limpiar nuevos posts al recargar manualmente
      clearNewPosts();
    } catch (error) {
      handleError(error, setToast, 'Error cargando el feed');
    }
  }, [user?.id, clearNewPosts]);

  const handlePostDeleted = useCallback(async () => {
    cacheRef.current = null;
    await loadFeed(true);
  }, [loadFeed]);

  const initialLoad = async () => {
    setIsLoading(true);
    await loadFeed();
    setIsLoading(false);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadFeed(true);
    setIsRefreshing(false);
  };

  useEffect(() => {
    initialLoad();

    // Sincronización en "tiempo real" periódica (cada 3.5 minutos = 210,000 ms)
    // para actualizar silenciosamente comentarios y reacciones en el feed
    const intervalId = setInterval(() => {
      loadFeed(true);
    }, 210000);

    // Recargar feed cuando la cola offline termina de sincronizarse
    const syncListener = DeviceEventEmitter.addListener('sync_completed', () => {
      loadFeed(true);
    });

    return () => {
      clearInterval(intervalId);
      syncListener.remove();
    };
  }, []);

  return {
    posts,
    isLoading,
    isRefreshing,
    toast,
    setToast,
    loadFeed,
    handlePostDeleted,
    onRefresh,
  };
}
