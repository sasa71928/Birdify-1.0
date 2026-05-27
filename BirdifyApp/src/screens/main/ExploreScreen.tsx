import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import MapView, { Marker } from 'react-native-maps';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import { useNavigation } from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/AppNavigator';

import { createStyles } from '../../styles/screens/main/exploreScreen.styles';

import { useDynamicStyles } from '../../hooks/useDynamicStyles';

import { SightingRepository } from '../../repositories/sighting.repository';

import { mapBird } from '../../utils/mapBird';

import * as Location from 'expo-location';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Explore'
>;

type MapSighting = {
  id: string;
  latitude: number | string;
  longitude: number | string;
  created_at: string;
  is_location_private?: boolean;
  bird?: any;
};

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

export default function ExploreScreen() {
  const { screen: styles, colors, isDark } =
    useDynamicStyles(createStyles);

  const navigation = useNavigation<NavProp>();

  const mapRef = useRef<MapView>(null);

  const MAP_STYLE = useMemo(
    () => createMapStyle(colors),
    [colors]
  );

  const [loading, setLoading] = useState(true);

  const [selectedMarker, setSelectedMarker] =
    useState<string | null>(null);

  const [sightings, setSightings] = useState<
    MapSighting[]
  >([]);

  const [searchQuery, setSearchQuery] = useState('');

  const [filteredSightings, setFilteredSightings] =
    useState<MapSighting[]>([]);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const DEFAULT_REGION = {
    latitude: 24.1426,
    longitude: -110.3128,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

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

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;

    const dLat =
      ((lat2 - lat1) * Math.PI) / 180;

    const dLon =
      ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
      2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return (R * c).toFixed(1);
  };

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

    } catch (error) {
      console.error(
        'Error loading sightings:',
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserLocation = async (isMounted: boolean) => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy:
            Location.Accuracy.High,
        });

      if (!isMounted) return;

      setUserLocation({
        latitude:
          location.coords.latitude,
        longitude:
          location.coords.longitude,
      });

    } catch (error) {
      if (!isMounted) return;
      console.error(
        'Error getting location:',
        error
      );
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

  useEffect(() => {
    setFilteredSightings(sightings);
  }, [sightings]);

  const selectedSighting = useMemo(() => {
    return (
      sightings.find(
        (s) => s.id === selectedMarker
      ) ?? null
    );
  }, [sightings, selectedMarker]);

  const closeSelection = useCallback(() => {
    if (!selectedSighting) {
      setSelectedMarker(null);
      return;
    }

    mapRef.current?.animateToRegion({
      latitude: Number(
        selectedSighting.latitude
      ),
      longitude: Number(
        selectedSighting.longitude
      ),
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

    const filtered = sightings.filter(
      (item) => {
        const birdName =
          item.bird?.common_name?.toLowerCase() || '';

        return birdName.includes(
          text.toLowerCase()
        );
      }
    );

    setFilteredSightings(filtered);
  };

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
        onPress={closeSelection}
      >
        {filteredSightings.map((item) => {
          const isSelected =
            selectedMarker === item.id;

          return (
            <Marker
              key={item.id}
              coordinate={{
                latitude: Number(item.latitude),
                longitude: Number(item.longitude),
              }}
              onPress={() => {

                setSelectedMarker(item.id);

                mapRef.current?.animateToRegion({
                  latitude: Number(
                    item.latitude
                  ),
                  longitude: Number(
                    item.longitude
                  ),
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
              }}
            >
              <MaterialCommunityIcons
                name="bird"
                size={42}
                color={
                  isSelected
                    ? colors.primaryDark
                    : colors.primary
                }
              />
            </Marker>
          );
        })}
      </MapView>

      {selectedSighting && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.calloutContainer}
          onPress={() => {

            if (!selectedSighting.bird) {
              return;
            }

            const mappedBird = mapBird(
              selectedSighting.bird,
              0
            );

            navigation.navigate(
              'BirdDetail',
              {
                bird: mappedBird,
              }
            );
          }}
        >
          <Text style={styles.calloutTitle}>
            {selectedSighting.bird
              ?.common_name ?? 'Bird'}
          </Text>

          <Text style={styles.calloutSubtitle}>
            {getTimeAgo(
              selectedSighting.created_at
            )}
          </Text>

          <Text style={styles.calloutHint}>
            Tap here for details
          </Text>
        </TouchableOpacity>
      )}

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
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </SafeAreaView>

      {searchQuery.length > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 110,
            left: 16,
            right: 16,
            maxHeight: 320,
            backgroundColor: colors.surface,
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <FlatList
            data={filteredSightings}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const distance = userLocation
                ? calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    Number(item.latitude),
                    Number(item.longitude)
                  )
                : null;

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedMarker(item.id);

                    setSearchQuery('');

                    mapRef.current?.animateToRegion({
                      latitude: Number(item.latitude),
                      longitude: Number(item.longitude),
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    });
                  }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 15,
                      fontWeight: '600',
                    }}
                  >
                    {item.bird?.common_name ?? 'Bird'}
                  </Text>

                  <Text
                    style={{
                      color: colors.textSecondary,
                      marginTop: 4,
                    }}
                  >
                    Lat: {Number(item.latitude).toFixed(4)}
                  </Text>

                  <Text
                    style={{
                      color: colors.textSecondary,
                    }}
                  >
                    Lng: {Number(item.longitude).toFixed(4)}
                  </Text>

                  {distance && (
                    <Text
                      style={{
                        color: colors.primary,
                        marginTop: 6,
                        fontWeight: '600',
                      }}
                    >
                      {distance} km away
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.locationButton}
        activeOpacity={0.8}
        onPress={() => {
          if (!userLocation) return;

          mapRef.current?.animateToRegion({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
          setSelectedMarker(null);
        }}
      >
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={24}
          color={colors.textPrimary}
        />
      </TouchableOpacity>
       </View>
  );
}