import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import shared from '../styles/shared.styles';

const { width } = Dimensions.get('window');
const GRID_SPACING = 8;
const COLUMN_COUNT = 3;
const ITEM_WIDTH = (width - (Spacing.md * 2) - (GRID_SPACING * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

const MOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1520638029751-c947dd098db5?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1612170153139-6f881ff0675c?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=300',
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle="dark-content" />
      <TopNavBar />

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300' }} 
              style={styles.avatar} 
            />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            </View>
          </View>
          
          <Text style={styles.name}>Ana Ruiz</Text>
          <View style={styles.professionBadge}>
            <MaterialCommunityIcons name="leaf" size={14} color={Colors.primary} />
            <Text style={styles.professionText}>Professional Birder</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1.2k</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>842</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.5k</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.bio}>
            Passionate ornithologist exploring the Baja peninsula. Focused on coastal species and conservation. 🌿📸
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Sightings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Bitacore</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Likes</Text>
          </TouchableOpacity>
        </View>

        {/* Grid of Photos */}
        <View style={styles.grid}>
          {MOCK_PHOTOS.map((uri, index) => (
            <TouchableOpacity key={index} style={styles.gridItem}>
              <Image source={{ uri }} style={styles.gridImage} />
              <View style={styles.locationBadge}>
                <Ionicons name="location" size={12} color={Colors.white} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  scrollContent: {
    paddingBottom: 120, // Espacio para el footer
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: Colors.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  name: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  professionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7F4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
  professionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: Spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E7E4',
  },
  bio: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7E4',
    marginHorizontal: Spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
    gap: GRID_SPACING,
  },
  gridItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  locationBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
