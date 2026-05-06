import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadows, Spacing } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

const MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#7E8180' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#333333' }],
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
    stylers: [{ color: '#E8E8E8' }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#E8E8E8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#555555' }],
  },
];

const MOCK_SIGHTINGS = [
  { id: '1', lat: 19.4326, lng: -99.1332, icon: 'bird' },
  { id: '2', lat: 19.4284, lng: -99.1450, icon: 'duck' },
  { id: '3', lat: 19.4350, lng: -99.1200, icon: 'owl' },
];

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* ── Mapa Estático (Fallback para Expo Go) ── */}
      <Image 
        source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-99.1332,19.4326,13,0/800x1600?access_token=pk.eyJ1IjoiY2hpdHUiLCJhIjoiY2tobnVnZzJvMGNxZzJzbXowam1vM3Z1ciJ9.9_n6rFv_Y0Z_X_1_1_1_1' }} 
        style={styles.map} 
      />

      {/* Pines manuales sobre la imagen */}
      <View style={[styles.pinWrapper, { position: 'absolute', top: '35%', left: '25%' }]}>
        <View style={styles.pinCircle}>
          <MaterialCommunityIcons name="bird" size={20} color={Colors.white} />
        </View>
        <View style={styles.pinArrow} />
      </View>

      <View style={[styles.pinWrapper, { position: 'absolute', top: '55%', left: '65%' }]}>
        <View style={styles.pinCircle}>
          <MaterialCommunityIcons name="duck" size={20} color={Colors.white} />
        </View>
        <View style={styles.pinArrow} />
      </View>

      {/* ── Elementos flotantes sobre el mapa ── */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search locations or species..."
            placeholderTextColor={Colors.placeholder}
          />
          <TouchableOpacity style={styles.filterButton}>
            <MaterialCommunityIcons name="filter-variant" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Botón de ubicación flotante */}
      <TouchableOpacity style={styles.locationButton} activeOpacity={0.8}>
        <MaterialCommunityIcons name="target" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    ...Shadows.card,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  filterButton: {
    padding: Spacing.xs,
  },
  // Marcadores personalizados del mapa
  pinWrapper: {
    alignItems: 'center',
  },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1B4D3E', // Forest Green
    borderWidth: 2,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  pinArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.white,
    marginTop: -1,
  },
  // Botón de target
  locationButton: {
    position: 'absolute',
    bottom: 90, // Por encima del BottomNavBar
    right: Spacing.md,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
});
