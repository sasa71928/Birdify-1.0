import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { Alert, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useAuth } from './AuthContext';
import { FollowRepository } from '../repositories/follow.repository';
import { Post } from '../components/FeedItem';

export type FeedFilterMode =
  | 'all'
  | 'following'
  | 'followers'
  | 'mutuals'
  | 'proximity';

export interface FeedPreferences {
  filterMode: FeedFilterMode;
  proximityRadiusKm: number; // 10, 25, 50, 100
  onlyVerified: boolean;
}

export const DEFAULT_FEED_PREFERENCES: FeedPreferences = {
  filterMode: 'all',
  proximityRadiusKm: 50,
  onlyVerified: false,
};

const STORAGE_KEY = '@birdify_feed_preferences_v1';
const FOLLOWS_CACHE_TTL_MS = 60_000;

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface FeedPreferencesContextType {
  preferences: FeedPreferences;
  isLoadingPreferences: boolean;
  isLoadingFollows: boolean;
  hasLoadedFollows: boolean;
  followsError: string | null;
  isLocating: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  locationPermissionGranted: boolean;
  followingIds: Set<string>;
  followerIds: Set<string>;
  setFilterMode: (mode: FeedFilterMode) => Promise<void>;
  setProximityRadius: (radius: number) => Promise<void>;
  setOnlyVerified: (onlyVerified: boolean) => Promise<void>;
  updatePreferences: (patch: Partial<FeedPreferences>) => Promise<void>;
  refreshFollows: (force?: boolean) => Promise<boolean>;
  invalidateFollows: () => void;
  requestLocation: () => Promise<{ latitude: number; longitude: number } | null>;
  filterPosts: (posts: Post[]) => Post[];
}

const FeedPreferencesContext = createContext<FeedPreferencesContextType | undefined>(
  undefined
);

export const FeedPreferencesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<FeedPreferences>(
    DEFAULT_FEED_PREFERENCES
  );
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isLoadingFollows, setIsLoadingFollows] = useState(false);
  const [hasLoadedFollows, setHasLoadedFollows] = useState(false);
  const [followsError, setFollowsError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followerIds, setFollowerIds] = useState<Set<string>>(new Set());

  const followsCacheRef = useRef<{
    userId?: string;
    timestamp: number;
    hasLoaded: boolean;
  }>({
    userId: undefined,
    timestamp: 0,
    hasLoaded: false,
  });
  const followsInFlightRef = useRef<Promise<boolean> | null>(null);
  const currentUserIdRef = useRef<string | undefined>(user?.id);
  currentUserIdRef.current = user?.id;

  // Cargar preferencias guardadas en AsyncStorage
  useEffect(() => {
    async function loadStoredPreferences() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences({
            ...DEFAULT_FEED_PREFERENCES,
            ...parsed,
          });
        }
      } catch (err) {
        console.error('Error loading feed preferences:', err);
      } finally {
        setIsLoadingPreferences(false);
      }
    }
    loadStoredPreferences();
  }, []);

  // Guardar cambios en AsyncStorage
  const persistPreferences = useCallback(async (newPrefs: FeedPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
    } catch (err) {
      console.error('Error saving feed preferences:', err);
    }
  }, []);

  const invalidateFollows = useCallback(() => {
    followsCacheRef.current.timestamp = 0;
  }, []);

  // Cargar seguidos y seguidores del usuario autenticado con caché por TTL y deduplicación
  const refreshFollows = useCallback(
    async (force = false): Promise<boolean> => {
      const targetUserId = user?.id;
      if (!targetUserId) {
        setFollowingIds(new Set());
        setFollowerIds(new Set());
        setHasLoadedFollows(false);
        setIsLoadingFollows(false);
        setFollowsError(null);
        followsCacheRef.current = {
          userId: undefined,
          timestamp: 0,
          hasLoaded: false,
        };
        followsInFlightRef.current = null;
        return true;
      }

      const now = Date.now();
      const cached = followsCacheRef.current;
      if (
        !force &&
        cached.userId === targetUserId &&
        cached.hasLoaded &&
        now - cached.timestamp < FOLLOWS_CACHE_TTL_MS
      ) {
        return true;
      }

      if (followsInFlightRef.current) {
        return followsInFlightRef.current;
      }

      if (!cached.hasLoaded || cached.userId !== targetUserId) {
        setIsLoadingFollows(true);
      }
      setFollowsError(null);

      const requestPromise = (async () => {
        try {
          const [following, followers] = await Promise.all([
            FollowRepository.getFollowingIds(targetUserId),
            FollowRepository.getFollowerIds(targetUserId),
          ]);

          if (currentUserIdRef.current !== targetUserId) {
            return false;
          }

          setFollowingIds(following);
          setFollowerIds(followers);
          setHasLoadedFollows(true);
          setFollowsError(null);
          followsCacheRef.current = {
            userId: targetUserId,
            timestamp: Date.now(),
            hasLoaded: true,
          };
          return true;
        } catch (err: any) {
          console.error('Error refreshing follows for feed:', err);
          if (currentUserIdRef.current !== targetUserId) {
            return false;
          }
          // No convertir un error de red/consulta en una lista vacía válida:
          // si no había datos previos válidos para este usuario, exponer el error
          if (
            !followsCacheRef.current.hasLoaded ||
            followsCacheRef.current.userId !== targetUserId
          ) {
            setHasLoadedFollows(false);
            setFollowsError(
              err?.message || 'No se pudo cargar tu lista de seguidos y seguidores.'
            );
          }
          return false;
        } finally {
          followsInFlightRef.current = null;
          if (currentUserIdRef.current === targetUserId) {
            setIsLoadingFollows(false);
          }
        }
      })();

      followsInFlightRef.current = requestPromise;
      return requestPromise;
    },
    [user?.id]
  );

  // Limpiar y recargar cuando cambia el usuario autenticado o cierra sesión
  useEffect(() => {
    const previousUserId = followsCacheRef.current.userId;
    if (previousUserId && previousUserId !== user?.id) {
      FollowRepository.clearSyncFlags(previousUserId);
    }

    setFollowingIds(new Set());
    setFollowerIds(new Set());
    setHasLoadedFollows(false);
    setFollowsError(null);
    followsCacheRef.current = {
      userId: user?.id,
      timestamp: 0,
      hasLoaded: false,
    };
    followsInFlightRef.current = null;

    if (user?.id) {
      refreshFollows(true);
    } else {
      setIsLoadingFollows(false);
    }
  }, [user?.id, refreshFollows]);

  // Actualizar e invalidar caché inmediatamente cuando el usuario sigue, deja de seguir o bloquea
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('follows_changed', (payload) => {
      if (!user?.id) return;
      followsCacheRef.current.timestamp = 0;

      if (payload?.followerId === user.id && payload?.followingId) {
        if (payload.action === 'follow') {
          setFollowingIds((prev) => {
            if (prev.has(payload.followingId)) return prev;
            const next = new Set(prev);
            next.add(payload.followingId);
            return next;
          });
        } else if (payload.action === 'unfollow' || payload.action === 'block') {
          setFollowingIds((prev) => {
            if (!prev.has(payload.followingId)) return prev;
            const next = new Set(prev);
            next.delete(payload.followingId);
            return next;
          });
          if (payload.action === 'block') {
            setFollowerIds((prev) => {
              if (!prev.has(payload.followingId)) return prev;
              const next = new Set(prev);
              next.delete(payload.followingId);
              return next;
            });
          }
        }
      }
    });

    return () => {
      sub.remove();
    };
  }, [user?.id]);

  // Obtener ubicación del usuario
  const requestLocation = useCallback(async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermissionGranted(false);
        return null;
      }
      setLocationPermissionGranted(true);
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setUserLocation(coords);
      return coords;
    } catch (err) {
      console.error('Error getting location for feed proximity:', err);
      return null;
    } finally {
      setIsLocating(false);
    }
  }, []);

  // Si el modo es proximidad y aún no tenemos coordenadas, solicitarlas
  useEffect(() => {
    if (preferences.filterMode === 'proximity' && !userLocation) {
      requestLocation();
    }
  }, [preferences.filterMode, userLocation, requestLocation]);

  const updatePreferences = useCallback(
    async (patch: Partial<FeedPreferences>) => {
      setPreferences((prev) => {
        const next = { ...prev, ...patch };
        persistPreferences(next);
        return next;
      });
    },
    [persistPreferences]
  );

  const setFilterMode = useCallback(
    async (mode: FeedFilterMode) => {
      if (mode === 'proximity') {
        const coords = await requestLocation();
        if (!coords && !userLocation) {
          Alert.alert(
            'Permiso de Ubicación Requerido',
            'Para ver los avistamientos cercanos a tu posición, Birdify necesita acceso a tu ubicación.'
          );
          return;
        }
      }
      if (
        (mode === 'following' || mode === 'followers' || mode === 'mutuals') &&
        user?.id
      ) {
        refreshFollows(false);
      }
      await updatePreferences({ filterMode: mode });
    },
    [updatePreferences, userLocation, requestLocation, user?.id, refreshFollows]
  );

  const setProximityRadius = useCallback(
    async (radius: number) => {
      await updatePreferences({ proximityRadiusKm: radius });
    },
    [updatePreferences]
  );

  const setOnlyVerified = useCallback(
    async (onlyVerified: boolean) => {
      await updatePreferences({ onlyVerified });
    },
    [updatePreferences]
  );

  // Función de respaldo para filtrar una lista de posts en memoria con las mismas reglas
  const filterPosts = useCallback(
    (posts: Post[]): Post[] => {
      return posts.filter((post) => {
        // 1. Filtro de usuarios verificados
        if (preferences.onlyVerified && !post.isVerified) {
          return false;
        }

        // 2. Filtro principal
        switch (preferences.filterMode) {
          case 'following': {
            if (!post.userId) return false;
            return followingIds.has(post.userId);
          }

          case 'followers': {
            if (!post.userId) return false;
            return followerIds.has(post.userId);
          }

          case 'mutuals': {
            if (!post.userId) return false;
            return (
              followingIds.has(post.userId) && followerIds.has(post.userId)
            );
          }

          case 'proximity': {
            if (!userLocation) return false;
            if (post.latitude == null || post.longitude == null) {
              return false; // avistamiento con ubicación privada o no especificada
            }
            const dist = calculateDistanceKm(
              userLocation.latitude,
              userLocation.longitude,
              post.latitude,
              post.longitude
            );
            return dist <= preferences.proximityRadiusKm;
          }

          case 'all':
          default:
            return true;
        }
      });
    },
    [
      preferences.filterMode,
      preferences.proximityRadiusKm,
      preferences.onlyVerified,
      followingIds,
      followerIds,
      userLocation,
    ]
  );

  return (
    <FeedPreferencesContext.Provider
      value={{
        preferences,
        isLoadingPreferences,
        isLoadingFollows,
        hasLoadedFollows,
        followsError,
        isLocating,
        userLocation,
        locationPermissionGranted,
        followingIds,
        followerIds,
        setFilterMode,
        setProximityRadius,
        setOnlyVerified,
        updatePreferences,
        refreshFollows,
        invalidateFollows,
        requestLocation,
        filterPosts,
      }}
    >
      {children}
    </FeedPreferencesContext.Provider>
  );
};

export function useFeedPreferences() {
  const context = useContext(FeedPreferencesContext);
  if (!context) {
    throw new Error(
      'useFeedPreferences must be used within a FeedPreferencesProvider'
    );
  }
  return context;
}
