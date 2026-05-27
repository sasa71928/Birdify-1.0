import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { createStyles } from '../../styles/screens/main/exploreScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

import { SightingRepository } from '../../repositories/sighting.repository';

type IconName = React.ComponentProps<
    typeof MaterialCommunityIcons
  >['name'];

type Sighting = {
  id: string;
  lat: number;
  lng: number;
  icon: IconName;
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



const MOCK_SIGHTINGS: Sighting[] = [
  {
    id: '1',
    lat: 19.4326,
    lng: -99.1332,
    icon: 'bird',
  },
  {
    id: '2',
    lat: 19.4284,
    lng: -99.1450,
    icon: 'duck',
  },
  {
    id: '3',
    lat: 19.4350,
    lng: -99.1200,
    icon: 'owl',
  },
];

export default function ExploreScreen() {
  const { screen: styles, colors, isDark } =
    useDynamicStyles(createStyles);

  const MAP_STYLE = createMapStyle(colors);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

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
          barStyle={isDark ? 'light-content' : 'dark-content'}
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
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* ── MAPA DINÁMICO ── */}
      <MapView
        style={styles.map}
        showsUserLocation
        showsCompass={false}
        showsMyLocationButton={false}
        customMapStyle={isDark ? MAP_STYLE : []}
        initialRegion={{
          latitude: 19.4326,
          longitude: -99.1332,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {MOCK_SIGHTINGS.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.lat,
              longitude: item.lng,
            }}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.pinWrapper}>
              <View style={styles.pinCircle}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={20}
                  color={colors.canvasPure}
                />
              </View>

              <View style={styles.pinArrow} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* ── OVERLAY ── */}
      <SafeAreaView
        style={styles.overlay}
        pointerEvents="box-none"
      >
        {/* Barra de búsqueda */}
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
          />

          <TouchableOpacity style={styles.filterButton}>
            <MaterialCommunityIcons
              name="filter-variant"
              size={20}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── BOTÓN UBICACIÓN ── */}
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