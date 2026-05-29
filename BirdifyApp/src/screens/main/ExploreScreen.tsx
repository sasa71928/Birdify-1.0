import React, { useMemo, useCallback } from 'react';

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

import { useExplore } from '../../hooks/useExplore';
import { mapBird } from '../../utils/mapBird';
import AppToast from '../../components/AppToast';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Explore'>;

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
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const navigation = useNavigation<NavProp>();

  const MAP_STYLE = useMemo(() => createMapStyle(colors), [colors]);

  const {
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
    setSearchQuery,
    setSelectedMarker,
    setToast,
    closeSelection,
    handleSearch,
    handleMarkerPress,
    getTimeAgo,
    calculateDistance,
  } = useExplore();

  const markers = useMemo(() => filteredSightings.map((item) => {
    const isSelected = selectedMarker === item.id;

    return (
      <Marker
        key={item.id}
        coordinate={{
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
        }}
        onPress={() => {
          handleMarkerPress(item.id);
          mapRef.current?.animateToRegion({
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 300);
        }}
      >
        <Ionicons
          name="location-sharp"
          size={isSelected ? 36 : 28}
          color={
            isSelected
              ? colors.secondaryBlue
              : colors.primary
          }
        />
      </Marker>
    );
  }), [filteredSightings, selectedMarker, colors.primary, colors.secondaryBlue, handleMarkerPress]);

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
      <AppToast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />

      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        showsCompass={false}
        showsMyLocationButton={false}
        moveOnMarkerPress={false}
        toolbarEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        customMapStyle={isDark ? MAP_STYLE : []}
        initialRegion={DEFAULT_REGION}
        onPress={closeSelection}
      >
        {markers}
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
            placeholder="Search bird..."
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