import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Alert } from 'react-native';
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
  userLocation: { latitude: number; longitude: number } | null;
  locationPermissionGranted: boolean;
  followingIds: Set<string>;
  followerIds: Set<string>;
  setFilterMode: (mode: FeedFilterMode) => Promise<void>;
  setProximityRadius: (radius: number) => Promise<void>;
  setOnlyVerified: (onlyVerified: boolean) => Promise<void>;
  updatePreferences: (patch: Partial<FeedPreferences>) => Promise<void>;
  refreshFollows: () => Promise<void>;
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
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followerIds, setFollowerIds] = useState<Set<string>>(new Set());

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

  // Cargar seguidos y seguidores del usuario autenticado
  const refreshFollows = useCallback(async () => {
    if (!user?.id) {
      setFollowingIds(new Set());
      setFollowerIds(new Set());
      return;
    }
    try {
      const [following, followers] = await Promise.all([
        FollowRepository.getFollowingIds(user.id),
        FollowRepository.getFollowerIds(user.id),
      ]);
      setFollowingIds(following);
      setFollowerIds(followers);
    } catch (err) {
      console.error('Error refreshing follows for feed:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshFollows();
  }, [refreshFollows]);

  // Obtener ubicación del usuario
  const requestLocation = useCallback(async () => {
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
      await updatePreferences({ filterMode: mode });
    },
    [updatePreferences, userLocation, requestLocation]
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

  // Función principal para filtrar posts
  const filterPosts = useCallback(
    (posts: Post[]): Post[] => {
      const currentUserId = user?.id;

      return posts.filter((post) => {
        // 1. Filtro de usuarios verificados
        if (preferences.onlyVerified && !post.isVerified) {
          return false;
        }

        // 2. Filtro principal
        switch (preferences.filterMode) {
          case 'following': {
            if (post.userId === currentUserId) return true;
            if (!post.userId) return false;
            return followingIds.has(post.userId);
          }

          case 'followers': {
            if (post.userId === currentUserId) return true;
            if (!post.userId) return false;
            return followerIds.has(post.userId);
          }

          case 'mutuals': {
            if (post.userId === currentUserId) return true;
            if (!post.userId) return false;
            return (
              followingIds.has(post.userId) && followerIds.has(post.userId)
            );
          }

          case 'proximity': {
            if (post.userId === currentUserId) return true;
            if (!userLocation) return true; // fallback si no hay ubicación
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
      user?.id,
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
        userLocation,
        locationPermissionGranted,
        followingIds,
        followerIds,
        setFilterMode,
        setProximityRadius,
        setOnlyVerified,
        updatePreferences,
        refreshFollows,
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
