import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import {
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import MapView, { Marker } from 'react-native-maps';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import { createStyles } from '../../styles/screens/main/exploreScreen.styles';

import { useDynamicStyles } from '../../hooks/useDynamicStyles';

import { SightingRepository } from '../../repositories/sighting.repository';

const createMapStyle = (colors: any) => [
  {
    elementType: 'geometry',
    stylers: [{ color: colors.surfaceDim }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: colors.textPrimary }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: colors.surface }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.neighborhood',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: colors.componentBase }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: colors.canvasPure }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: colors.deepTerrain }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: colors.surfaceDim }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: colors.surface }],
  },
];

type MapSighting = {
  id: string;
  latitude: number | string;
  longitude: number | string;
  created_at: string;
  is_location_private?: boolean;
  bird?: {
    common_name?: string;
  };
};

export default function ExploreScreen() {
  const { screen: styles, colors, isDark } =
    useDynamicStyles(createStyles);

  const MAP_STYLE = useMemo(
    () => createMapStyle(colors),
    [colors]
  );

  const mapRef = useRef<MapView>(null);

  const [loading, setLoading] = useState(true);

  const [sightings, setSightings] = useState<
    MapSighting[]
  >([]);

  const loadSightings = useCallback(async () => {
    try {
      setLoading(true);

      const data =
        await SightingRepository.getFeed();

      const validSightings = data.filter(
        (item) =>
          item.latitude != null &&
          item.longitude != null &&
          !item.is_location_private
      );


      setSightings(validSightings);

      if (validSightings.length > 0) {
        mapRef.current?.animateToRegion({
          latitude: Number(
            validSightings[0].latitude
          ),
          longitude: Number(
            validSightings[0].longitude
          ),
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
      }
    } catch (error) {
      console.error(
        'Error loading sightings:',
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSightings();
  }, [loadSightings]);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.surface,
          },
        ]}
      >
        <StatusBar
          barStyle={
            isDark
              ? 'light-content'
              : 'dark-content'
          }
        />

        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);

    const seconds = Math.floor(
      (now.getTime() - date.getTime()) / 1000
    );

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    if (hours < 24) {
      return `${hours}h ago`;
    }

    return `${days}d ago`;
  };

  const DEFAULT_REGION = {
  latitude: 24.1426,
  longitude: -110.3128,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={
          isDark
            ? 'light-content'
            : 'dark-content'
        }
      />

      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        showsCompass={false}
        showsMyLocationButton={false}
        customMapStyle={isDark ? MAP_STYLE : []}
        initialRegion={DEFAULT_REGION}
      >
        {sightings.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: Number(item.latitude),
              longitude: Number(item.longitude),
            }}
            title={item.bird?.common_name ?? 'Bird'}
            description={`${getTimeAgo(item.created_at)} • Bird sighting`}
            onPress={() => {
              mapRef.current?.animateToRegion({
                latitude: Number(item.latitude),
                longitude: Number(item.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
            }}
            onDeselect={async () => {
              const camera = await mapRef.current?.getCamera();

              if (!camera) return;

              mapRef.current?.animateToRegion({
                latitude: camera.center.latitude,
                longitude: camera.center.longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              });
            }}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={42}
              color={colors.primary}
            />
          </Marker>
        ))}
      </MapView>

      <SafeAreaView
        style={styles.overlay}
        pointerEvents="box-none"
      >
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search locations or species..."
            placeholderTextColor={
              colors.placeholder
            }
          />

          <TouchableOpacity
            style={styles.filterButton}
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={20}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <TouchableOpacity
        style={styles.locationButton}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="target"
          size={24}
          color={colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );
}