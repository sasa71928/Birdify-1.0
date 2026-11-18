import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { SightingRepository, FeedQueryFilters } from '../repositories/sighting.repository';
import { useAuth } from '../context/AuthContext';
import { useFeedPreferences } from '../context/FeedPreferencesContext';
import { Post } from '../components/FeedItem';
import { handleError } from '../utils/errorHandler';
import { useNewSightings } from '../context/NewSightingsContext';

const CACHE_TTL_MS = 60000;
const FEED_PAGE_SIZE = 20;

interface FeedCacheEntry {
  posts: Post[];
  page: number;
  nextOffset: number;
  hasMore: boolean;
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
  const {
    preferences,
    isLoadingPreferences,
    hasLoadedFollows,
    followsError,
    isLocating,
    userLocation,
    followingIds,
    followerIds,
    refreshFollows,
    requestLocation,
  } = useFeedPreferences();

  const cacheMapRef = useRef<Map<string, FeedCacheEntry>>(new Map());
  const requestIdRef = useRef(0);
  const pageRef = useRef(0);
  const nextOffsetRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const prevUserIdRef = useRef<string | undefined>(user?.id);

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const isAuthorFilter =
    preferences.filterMode === 'following' ||
    preferences.filterMode === 'followers' ||
    preferences.filterMode === 'mutuals';

  const resolvedAuthorIds = useMemo<string[] | null>(() => {
    if (!isAuthorFilter) return null;
    if (!user?.id) return [];
    if (!hasLoadedFollows) return null;

    if (preferences.filterMode === 'following') {
      return Array.from(followingIds);
    }
    if (preferences.filterMode === 'followers') {
      return Array.from(followerIds);
    }
    return Array.from(followingIds).filter((id) => followerIds.has(id));
  }, [
    isAuthorFilter,
    user?.id,
    hasLoadedFollows,
    preferences.filterMode,
    followingIds,
    followerIds,
  ]);

  const isFilterDataPending =
    isLoadingPreferences ||
    (isAuthorFilter && Boolean(user?.id) && !hasLoadedFollows && !followsError) ||
    (preferences.filterMode === 'proximity' && !userLocation && isLocating);

  const queryKey = useMemo(() => {
    const userPart = user?.id ?? 'anon';
    const verifiedPart = preferences.onlyVerified ? 'v1' : 'v0';
    let modePart: string = preferences.filterMode;
    if (isAuthorFilter) {
      const sortedAuthors = resolvedAuthorIds
        ? [...resolvedAuthorIds].sort().join(',')
        : 'pending';
      modePart = `${preferences.filterMode}:[${sortedAuthors}]`;
    } else if (preferences.filterMode === 'proximity') {
      const locPart = userLocation
        ? `${userLocation.latitude.toFixed(3)},${userLocation.longitude.toFixed(3)},r=${preferences.proximityRadiusKm}`
        : 'noloc';
      modePart = `proximity:${locPart}`;
    }
    return `${userPart}|${modePart}|${verifiedPart}`;
  }, [
    user?.id,
    preferences.filterMode,
    preferences.onlyVerified,
    preferences.proximityRadiusKm,
    isAuthorFilter,
    resolvedAuthorIds,
    userLocation,
  ]);

  const buildFeedFilters = useCallback(
    (offset: number): FeedQueryFilters => ({
      filterMode: preferences.filterMode,
      authorIds: isAuthorFilter ? (resolvedAuthorIds ?? []) : null,
      onlyVerified: preferences.onlyVerified,
      proximity:
        preferences.filterMode === 'proximity' && userLocation
          ? {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              radiusKm: preferences.proximityRadiusKm,
            }
          : null,
      offset,
    }),
    [
      preferences.filterMode,
      preferences.onlyVerified,
      preferences.proximityRadiusKm,
      isAuthorFilter,
      resolvedAuthorIds,
      userLocation,
    ]
  );

  const loadFeed = useCallback(
    async (forceRefresh = false) => {
      if (isFilterDataPending) {
        return;
      }

      if (isAuthorFilter && user?.id && !hasLoadedFollows && followsError) {
        setPosts([]);
        setHasMore(false);
        setLoadError(followsError);
        return;
      }

      if (preferences.filterMode === 'proximity' && !userLocation && !isLocating) {
        setPosts([]);
        setHasMore(false);
        setLoadError(
          'Se requiere acceso a tu ubicación para filtrar avistamientos cercanos.'
        );
        return;
      }

      const now = Date.now();
      const currentUserId = user?.id;
      const cached = cacheMapRef.current.get(queryKey);

      if (
        !forceRefresh &&
        cached &&
        cached.userId === currentUserId &&
        now - cached.timestamp < CACHE_TTL_MS
      ) {
        setPosts(cached.posts);
        setHasMore(cached.hasMore);
        pageRef.current = cached.page;
        nextOffsetRef.current = cached.nextOffset;
        setLoadError(null);
        setLoadMoreError(null);
        return;
      }

      const requestId = ++requestIdRef.current;
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
      setLoadError(null);
      setLoadMoreError(null);

      try {
        const result = await SightingRepository.getFeedPage(
          currentUserId,
          0,
          FEED_PAGE_SIZE,
          buildFeedFilters(0)
        );
        if (requestId !== requestIdRef.current) return;

        const seenIds = new Set<string>();
        const mappedPosts: Post[] = [];
        for (const item of result.items) {
          if (!item?.id || seenIds.has(item.id)) continue;
          seenIds.add(item.id);
          mappedPosts.push(mapSightingToPost(item, user));
        }

        pageRef.current = 0;
        nextOffsetRef.current = result.nextOffset;
        setHasMore(result.hasMore);
        setPosts(mappedPosts);
        setLoadError(null);

        cacheMapRef.current.set(queryKey, {
          posts: mappedPosts,
          page: 0,
          nextOffset: result.nextOffset,
          hasMore: result.hasMore,
          timestamp: Date.now(),
          userId: currentUserId,
        });

        clearNewPosts();
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        setLoadError('No se pudieron cargar las publicaciones. Revisa tu conexión e inténtalo de nuevo.');
        handleError(error, setToast, 'Error cargando el feed');
      }
    },
    [
      isFilterDataPending,
      isAuthorFilter,
      user,
      hasLoadedFollows,
      followsError,
      preferences.filterMode,
      userLocation,
      isLocating,
      queryKey,
      buildFeedFilters,
      clearNewPosts,
    ]
  );

  const loadMore = useCallback(
    async (isRetry = false) => {
      if (
        isLoading ||
        isRefreshing ||
        loadingMoreRef.current ||
        !hasMore ||
        isFilterDataPending ||
        Boolean(loadError) ||
        (Boolean(loadMoreError) && !isRetry)
      ) {
        return;
      }

      loadingMoreRef.current = true;
      setIsLoadingMore(true);
      setLoadMoreError(null);

      const activeRequestId = requestIdRef.current;
      const targetPage = pageRef.current + 1;
      const targetOffset = nextOffsetRef.current;
      const activeQueryKey = queryKey;
      const currentUserId = user?.id;

      try {
        const result = await SightingRepository.getFeedPage(
          currentUserId,
          targetPage,
          FEED_PAGE_SIZE,
          buildFeedFilters(targetOffset)
        );

        if (activeRequestId !== requestIdRef.current) return;

        const mappedNew = result.items.map((item) => mapSightingToPost(item, user));

        pageRef.current = targetPage;
        nextOffsetRef.current = result.nextOffset;
        setHasMore(result.hasMore);

        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNew = mappedNew.filter((p) => !existingIds.has(p.id));
          const combined = [...prev, ...uniqueNew];

          cacheMapRef.current.set(activeQueryKey, {
            posts: combined,
            page: targetPage,
            nextOffset: result.nextOffset,
            hasMore: result.hasMore,
            timestamp: Date.now(),
            userId: currentUserId,
          });

          return combined;
        });
      } catch (error) {
        if (activeRequestId !== requestIdRef.current) return;
        setLoadMoreError('No se pudieron cargar más publicaciones.');
        handleError(error, setToast, 'Error cargando más publicaciones');
      } finally {
        if (activeRequestId === requestIdRef.current) {
          loadingMoreRef.current = false;
          setIsLoadingMore(false);
        }
      }
    },
    [
      isLoading,
      isRefreshing,
      hasMore,
      isFilterDataPending,
      loadError,
      loadMoreError,
      queryKey,
      user,
      buildFeedFilters,
    ]
  );

  const retryLoadMore = useCallback(async () => {
    await loadMore(true);
  }, [loadMore]);

  const handlePostDeleted = useCallback(async () => {
    cacheMapRef.current.clear();
    await loadFeed(true);
  }, [loadFeed]);

  const handleLikeToggled = useCallback(
    (postId: string, hasLiked: boolean, newCount: number) => {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, hasLiked, likes: newCount } : p))
      );
      cacheMapRef.current.forEach((entry, key) => {
        if (entry.userId === user?.id && entry.posts.some((p) => p.id === postId)) {
          cacheMapRef.current.set(key, {
            ...entry,
            posts: entry.posts.map((p) =>
              p.id === postId ? { ...p, hasLiked, likes: newCount } : p
            ),
          });
        }
      });
    },
    [user?.id]
  );

  const handleCommentAdded = useCallback(
    (postId: string, newCount: number) => {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: newCount } : p))
      );
      cacheMapRef.current.forEach((entry, key) => {
        if (entry.userId === user?.id && entry.posts.some((p) => p.id === postId)) {
          cacheMapRef.current.set(key, {
            ...entry,
            posts: entry.posts.map((p) =>
              p.id === postId ? { ...p, comments: newCount } : p
            ),
          });
        }
      });
    },
    [user?.id]
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (isAuthorFilter && user?.id) {
        const ok = await refreshFollows(true);
        if (!ok && !hasLoadedFollows) {
          return;
        }
      }
      if (preferences.filterMode === 'proximity' && !userLocation) {
        const coords = await requestLocation();
        if (!coords) {
          setLoadError(
            'Se requiere acceso a tu ubicación para filtrar avistamientos cercanos.'
          );
          return;
        }
      }
      await loadFeed(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    isAuthorFilter,
    user?.id,
    refreshFollows,
    hasLoadedFollows,
    preferences.filterMode,
    userLocation,
    requestLocation,
    loadFeed,
  ]);

  const retryInitialLoad = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthorFilter && user?.id && !hasLoadedFollows) {
        const ok = await refreshFollows(true);
        if (!ok) return;
      }
      if (preferences.filterMode === 'proximity' && !userLocation) {
        const coords = await requestLocation();
        if (!coords) {
          setLoadError(
            'Se requiere acceso a tu ubicación para filtrar avistamientos cercanos.'
          );
          return;
        }
      }
      await loadFeed(true);
    } finally {
      setIsLoading(false);
    }
  }, [
    isAuthorFilter,
    user?.id,
    hasLoadedFollows,
    refreshFollows,
    preferences.filterMode,
    userLocation,
    requestLocation,
    loadFeed,
  ]);

  // Limpiar caché completa al cambiar de usuario o cerrar sesión
  useEffect(() => {
    if (prevUserIdRef.current !== user?.id) {
      prevUserIdRef.current = user?.id;
      cacheMapRef.current.clear();
      requestIdRef.current += 1;
      pageRef.current = 0;
      nextOffsetRef.current = 0;
      loadingMoreRef.current = false;
      setPosts([]);
      setHasMore(false);
      setLoadError(null);
      setLoadMoreError(null);
    }
  }, [user?.id]);

  // Reaccionar a cambios de filtro, usuario o finalización de prerrequisitos
  useEffect(() => {
    requestIdRef.current += 1;
    loadingMoreRef.current = false;
    setIsLoadingMore(false);
    setLoadMoreError(null);

    if (isFilterDataPending) {
      setIsLoading(true);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    const run = async () => {
      const cached = cacheMapRef.current.get(queryKey);
      const isFresh =
        cached &&
        cached.userId === user?.id &&
        Date.now() - cached.timestamp < CACHE_TTL_MS;

      if (!isFresh) {
        setIsLoading(true);
      }
      await loadFeed(false);
      if (!cancelled) {
        setIsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [queryKey, isFilterDataPending, loadFeed, user?.id]);

  // Sincronización periódica y eventos globales
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadFeed(true);
    }, 300000);

    const syncListener = DeviceEventEmitter.addListener('sync_completed', () => {
      cacheMapRef.current.clear();
      loadFeed(true);
    });

    const refreshListener = DeviceEventEmitter.addListener('refresh_feed', () => {
      cacheMapRef.current.clear();
      loadFeed(true);
    });

    return () => {
      clearInterval(intervalId);
      syncListener.remove();
      refreshListener.remove();
    };
  }, [loadFeed]);

  return {
    posts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    loadError,
    loadMoreError,
    toast,
    setToast,
    loadFeed,
    loadMore,
    retryLoadMore,
    retryInitialLoad,
    handlePostDeleted,
    handleLikeToggled,
    handleCommentAdded,
    onRefresh,
  };
}
