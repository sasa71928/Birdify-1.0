import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadows, Spacing } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Full screen Map Placeholder */}
      <Image 
        source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-73.9653,40.7829,13,0/600x1200?access_token=pk.eyJ1IjoiY2hpdHUiLCJhIjoiY2tobnVnZzJvMGNxZzJzbXowam1vM3Z1ciJ9.9_n6rFv_Y0Z_X_1_1_1_1' }} 
        style={styles.map} 
      />

      {/* Floating Search Bar */}
      <SafeAreaView style={styles.overlay}>
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

        {/* Mock Map Pins */}
        <View style={[styles.pin, { top: '25%', left: '20%' }]}>
            <View style={styles.pinCircle}>
                <MaterialCommunityIcons name="owl" size={20} color={Colors.white} />
            </View>
            <View style={styles.pinArrow} />
        </View>

        <View style={[styles.pin, { top: '45%', left: '60%' }]}>
            <View style={styles.pinCircle}>
                <MaterialCommunityIcons name="duck" size={20} color={Colors.white} />
            </View>
            <View style={styles.pinArrow} />
        </View>

        {/* Location Button */}
        <TouchableOpacity style={styles.locationButton}>
            <MaterialCommunityIcons name="target" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </SafeAreaView>

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
    flex: 1,
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
  pin: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1B4D3E',
    borderWidth: 3,
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
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.white,
    marginTop: -1,
  },
  locationButton: {
    position: 'absolute',
    bottom: 120,
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
