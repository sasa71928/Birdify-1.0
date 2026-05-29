import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import MapView from 'react-native-maps';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SightingRepository } from '../repositories/sighting.repository';
import * as Location from 'expo-location';
import { handleError } from '../utils/errorHandler';

type ExploreNavProp = NativeStackNavigationProp<RootStackParamList, 'Explore'>;
type ExploreRouteProp = RouteProp<RootStackParamList, 'Explore'>;

type MapSighting = {
  id: string;
  latitude: number | string;
  longitude: number | string;
  created_at: string;
  is_location_private?: boolean;
  bird?: any;
};

const DEFAULT_REGION = {
  latitude: 24.1426,
  longitude: -110.3128,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export function useExplore() {
  const navigation = useNavigation<ExploreNavProp>();
  const route = useRoute<ExploreRouteProp>();
  const mapRef = useRef<MapView>(null);
  
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [sightings, setSightings] = useState<MapSighting[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSightings, setFilteredSightings] = useState<MapSighting[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const targetSighting = route.params?.targetSighting;

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const loadSightings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SightingRepository.getFeed();
      const validSightings = data.filter(
        (item) =>
          item.latitude != null &&
          item.longitude != null &&
          !item.is_location_private
      );
      setSightings(validSightings);
    } catch (error) {
      handleError(error, setToast, 'Error loading sightings');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserLocation = async (isMounted: boolean) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (!isMounted) return;

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      if (!isMounted) return;
      console.error('Error getting location:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeScreen = async () => {
      await loadSightings();
      await loadUserLocation(isMounted);
    };

    initializeScreen();

    return () => {
      isMounted = false;
    };
  }, [loadSightings]);

  // Navigate to target sighting if provided
  useEffect(() => {
    if (targetSighting && sightings.length > 0) {
      setSelectedMarker(targetSighting.id);
      mapRef.current?.animateToRegion({
        latitude: targetSighting.latitude,
        longitude: targetSighting.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [targetSighting, sightings]);

  useEffect(() => {
    setFilteredSightings(sightings);
  }, [sightings]);

  const selectedSighting = useMemo(() => {
    return sightings.find((s) => s.id === selectedMarker) ?? null;
  }, [sightings, selectedMarker]);

  const closeSelection = useCallback(() => {
    if (!selectedSighting) {
      setSelectedMarker(null);
      return;
    }

    mapRef.current?.animateToRegion({
      latitude: Number(selectedSighting.latitude),
      longitude: Number(selectedSighting.longitude),
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    });

    setSelectedMarker(null);
  }, [selectedSighting]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (!text.trim()) {
      setFilteredSightings(sightings);
      return;
    }

    const filtered = sightings.filter((item) => {
      const birdName = item.bird?.common_name?.toLowerCase() || '';
      return birdName.includes(text.toLowerCase());
    });

    setFilteredSightings(filtered);
  };

  const handleMarkerPress = (sightingId: string) => {
    setSelectedMarker(sightingId);
  };

  const navigateToSighting = (sightingId: string) => {
    // Navigate to sighting detail if needed
  };

  return {
    // State
    loading,
    selectedMarker,
    sightings,
    searchQuery,
    filteredSightings,
    userLocation,
    selectedSighting,
    DEFAULT_REGION,
    mapRef,
    toast,
    
    // Setters
    setSearchQuery,
    setSelectedMarker,
    setToast,
    
    // Actions
    loadSightings,
    loadUserLocation,
    closeSelection,
    handleSearch,
    handleMarkerPress,
    navigateToSighting,
    getTimeAgo,
    calculateDistance,
  };
}
