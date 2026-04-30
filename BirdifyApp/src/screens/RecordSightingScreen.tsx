import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import shared from '../styles/shared.styles';

export default function RecordSightingScreen() {
  const [isPrivate, setIsPrivate] = useState(false);

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle="dark-content" />
      <TopNavBar />

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Record Sighting</Text>
        <Text style={styles.subtitle}>Log your latest observation for your life list.</Text>

        {/* Photo Upload Area */}
        <TouchableOpacity style={styles.photoContainer}>
          <View style={styles.photoInner}>
            <View style={styles.cameraIconBg}>
                <Ionicons name="camera-outline" size={32} color={Colors.primary} />
                <View style={styles.plusIconBadge}>
                    <Ionicons name="add" size={12} color={Colors.primary} />
                </View>
            </View>
            <Text style={styles.photoTitle}>Tap to add photo</Text>
            <Text style={styles.photoSubtitle}>High quality images help identification</Text>
          </View>
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={styles.label}>Identify Bird</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search species or enter unknown..."
              placeholderTextColor={Colors.placeholder}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Observation Notes</Text>
          <View style={styles.notesContainer}>
            <TextInput 
              style={styles.notesInput}
              placeholder="What was it doing? Describe its behavior, song, or habitat..."
              placeholderTextColor={Colors.placeholder}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <View style={styles.locationHeader}>
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity style={styles.useCurrentBtn}>
              <MaterialCommunityIcons name="target" size={18} color={Colors.primary} />
              <Text style={styles.useCurrentText}>Use current</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mapContainer}>
            <Image 
              source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-73.9653,40.7829,14,0/600x300?access_token=pk.eyJ1IjoiY2hpdHUiLCJhIjoiY2tobnVnZzJvMGNxZzJzbXowam1vM3Z1ciJ9.9_n6rFv_Y0Z_X_1_1_1_1' }} 
              style={styles.mapImage} 
            />
            <View style={styles.mapPin}>
                <Ionicons name="location" size={30} color="#1B4D3E" />
            </View>
            <TouchableOpacity style={styles.adjustPinBtn}>
              <Ionicons name="location-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.adjustPinText}>Adjust Pin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Private Location Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <MaterialCommunityIcons name="eye-off-outline" size={22} color={Colors.textSecondary} />
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Private Location</Text>
              <Text style={styles.toggleSubtitle}>Hide exact coordinates from public feed</Text>
            </View>
          </View>
          <Switch 
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: '#DDE3E0', true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        {/* Post Button */}
        <TouchableOpacity style={styles.postButton}>
          <Ionicons name="paper-plane" size={20} color={Colors.white} style={styles.postIcon} />
          <Text style={styles.postButtonText}>Post Sighting</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    marginTop: 4,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1.2,
    borderWidth: 2,
    borderColor: '#C8D1CE',
    borderStyle: 'dashed',
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  photoInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F7F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  plusIconBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
  },
  photoTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  photoSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECF0EF',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  notesContainer: {
    backgroundColor: '#ECF0EF',
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 120,
  },
  notesInput: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  useCurrentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  useCurrentText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary,
    marginLeft: 4,
  },
  mapContainer: {
    width: '100%',
    height: 180,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapPin: {
    position: 'absolute',
    top: '40%',
    left: '48%',
  },
  adjustPinBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    ...Shadows.card,
  },
  adjustPinText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAF9',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E8EDEB',
    marginBottom: Spacing.xl,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: Spacing.sm,
  },
  toggleTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  postButton: {
    backgroundColor: '#2D5A27',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    ...Shadows.button,
  },
  postIcon: {
    marginRight: 8,
    transform: [{ rotate: '45deg' }], // Slight angle for the paper plane
    marginTop: -4,
  },
  postButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
});
