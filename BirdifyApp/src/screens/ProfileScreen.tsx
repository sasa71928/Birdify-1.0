import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import shared from '../styles/shared.styles';

const { width } = Dimensions.get('window');
const GRID_SPACING = 6;
const COLUMN_COUNT = 3;
const ITEM_WIDTH = (width - Spacing.md * 2 - GRID_SPACING * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

// ── Datos de ejemplo ──────────────────────────────────────────────────────────
const SIGHTING_PHOTOS = [
  { uri: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&q=80&w=300', location: 'La Paz' },
  { uri: 'https://images.unsplash.com/photo-1520638029751-c947dd098db5?auto=format&fit=crop&q=80&w=300', location: 'Ensenada' },
  { uri: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=300', location: 'CDMX' },
  { uri: 'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?auto=format&fit=crop&q=80&w=300', location: 'Oaxaca' },
  { uri: 'https://images.unsplash.com/photo-1612170153139-6f881ff0675c?auto=format&fit=crop&q=80&w=300', location: 'Mérida' },
  { uri: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=300', location: 'Loreto' },
];

const LOGBOOK_ENTRIES = [
  { id: '1', name: 'Northern Cardinal', scientificName: 'Cardinalis cardinalis', image: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&q=80&w=200', count: 12, date: 'Apr 28, 2024', rare: false },
  { id: '2', name: 'Blue Jay',          scientificName: 'Cyanocitta cristata',     image: 'https://images.unsplash.com/photo-1520638029751-c947dd098db5?auto=format&fit=crop&q=80&w=200', count: 8,  date: 'Apr 20, 2024', rare: false },
  { id: '3', name: 'Bald Eagle',        scientificName: 'Haliaeetus leucocephalus', image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=200', count: 2,  date: 'Mar 15, 2024', rare: true },
  { id: '4', name: 'Ruby-throated Hummingbird', scientificName: 'Archilochus colubris', image: 'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?auto=format&fit=crop&q=80&w=200', count: 5, date: 'Mar 02, 2024', rare: false },
  { id: '5', name: 'American Robin',    scientificName: 'Turdus migratorius',      image: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=200', count: 21, date: 'Feb 14, 2024', rare: false },
  { id: '6', name: 'Mourning Dove',     scientificName: 'Zenaida macroura',        image: 'https://images.unsplash.com/photo-1612170153139-6f881ff0675c?auto=format&fit=crop&q=80&w=200', count: 34, date: 'Jan 30, 2024', rare: false },
];

const LIKED_POSTS = [
  { id: '1', user: 'ElenaRios',    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', image: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&q=80&w=300', bird: 'Northern Cardinal', likes: 245 },
  { id: '2', user: 'CarlosMendez', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', image: 'https://images.unsplash.com/photo-1520638029751-c947dd098db5?auto=format&fit=crop&q=80&w=300', bird: 'Blue Jay',           likes: 89 },
  { id: '3', user: 'MikeTh',       avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100', image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=300', bird: 'Bald Eagle',        likes: 312 },
  { id: '4', user: 'SarahJ',       avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100', image: 'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?auto=format&fit=crop&q=80&w=300', bird: 'Hummingbird',       likes: 178 },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────
type Tab = 'Sightings' | 'Logbook' | 'Likes';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('Sightings');

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle="dark-content" />
      <TopNavBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]} // makes tabs sticky
      >
        {/* ── Profile Header ── */}
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

          {/* Stats */}
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
              <Text style={styles.statValue}>{LOGBOOK_ENTRIES.length}</Text>
              <Text style={styles.statLabel}>Species</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>82</Text>
              <Text style={styles.statLabel}>Sightings</Text>
            </View>
          </View>

          <Text style={styles.bio}>
            Passionate ornithologist exploring the Baja peninsula. Focused on coastal species and conservation. 🌿📸
          </Text>
        </View>

        {/* ── Tabs (sticky) ── */}
        <View style={styles.tabsContainer}>
          {(['Sightings', 'Logbook', 'Likes'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              {tab === 'Sightings' && <Ionicons name="camera-outline" size={16} color={activeTab === tab ? Colors.primary : Colors.textSecondary} />}
              {tab === 'Logbook'   && <MaterialCommunityIcons name="notebook-outline" size={16} color={activeTab === tab ? Colors.primary : Colors.textSecondary} />}
              {tab === 'Likes'     && <Ionicons name="heart-outline" size={16} color={activeTab === tab ? Colors.primary : Colors.textSecondary} />}
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab content ── */}
        {activeTab === 'Sightings' && <SightingsGrid />}
        {activeTab === 'Logbook'   && <LogbookView />}
        {activeTab === 'Likes'     && <LikesView />}

      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
}

// ── Sightings grid ────────────────────────────────────────────────────────────
function SightingsGrid() {
  return (
    <View style={styles.grid}>
      {SIGHTING_PHOTOS.map((item, i) => (
        <TouchableOpacity key={i} style={styles.gridItem} activeOpacity={0.85}>
          <Image source={{ uri: item.uri }} style={styles.gridImage} />
          <View style={styles.locationBadge}>
            <Ionicons name="location" size={11} color={Colors.white} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Logbook ───────────────────────────────────────────────────────────────────
function LogbookView() {
  const totalSpecies = LOGBOOK_ENTRIES.length;
  const rareCount    = LOGBOOK_ENTRIES.filter((e) => e.rare).length;
  const totalSightings = LOGBOOK_ENTRIES.reduce((sum, e) => sum + e.count, 0);

  return (
    <View style={styles.logbookContainer}>

      {/* Summary bar */}
      <View style={styles.logbookSummary}>
        <View style={styles.logbookStat}>
          <MaterialCommunityIcons name="bird" size={22} color={Colors.primary} />
          <Text style={styles.logbookStatValue}>{totalSpecies}</Text>
          <Text style={styles.logbookStatLabel}>Species</Text>
        </View>
        <View style={styles.logbookStatDivider} />
        <View style={styles.logbookStat}>
          <MaterialCommunityIcons name="star-outline" size={22} color={Colors.tertiaryBrown} />
          <Text style={styles.logbookStatValue}>{rareCount}</Text>
          <Text style={styles.logbookStatLabel}>Rare</Text>
        </View>
        <View style={styles.logbookStatDivider} />
        <View style={styles.logbookStat}>
          <Ionicons name="eye-outline" size={22} color={Colors.secondaryBlue} />
          <Text style={styles.logbookStatValue}>{totalSightings}</Text>
          <Text style={styles.logbookStatLabel}>Sightings</Text>
        </View>
      </View>

      {/* Bird stamps */}
      <Text style={styles.logbookSectionTitle}>Bird Stamps</Text>
      <View style={styles.stampsGrid}>
        {LOGBOOK_ENTRIES.map((entry) => (
          <TouchableOpacity key={entry.id} style={styles.stampCard} activeOpacity={0.82}>
            {/* Stamp image */}
            <View style={[styles.stampImageWrap, entry.rare && styles.stampImageRare]}>
              <Image source={{ uri: entry.image }} style={styles.stampImage} />
              {entry.rare && (
                <View style={styles.rareBadge}>
                  <MaterialCommunityIcons name="star" size={10} color={Colors.canvasPure} />
                </View>
              )}
              {/* Perforation dots top */}
              <View style={styles.perfTop}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <View key={i} style={styles.perfDot} />
                ))}
              </View>
              {/* Perforation dots bottom */}
              <View style={styles.perfBottom}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <View key={i} style={styles.perfDot} />
                ))}
              </View>
            </View>

            <Text style={styles.stampName} numberOfLines={1}>{entry.name}</Text>
            <Text style={styles.stampScientific} numberOfLines={1}>{entry.scientificName}</Text>

            {/* Count badge */}
            <View style={styles.stampCountRow}>
              <Ionicons name="eye-outline" size={11} color={Colors.textSecondary} />
              <Text style={styles.stampCount}>×{entry.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

    </View>
  );
}

// ── Likes ─────────────────────────────────────────────────────────────────────
function LikesView() {
  return (
    <View style={styles.likesContainer}>
      {LIKED_POSTS.map((post) => (
        <TouchableOpacity key={post.id} style={styles.likeCard} activeOpacity={0.88}>
          <Image source={{ uri: post.image }} style={styles.likeImage} />
          <View style={styles.likeOverlay}>
            <View style={styles.likeAuthorRow}>
              <Image source={{ uri: post.avatar }} style={styles.likeAvatar} />
              <Text style={styles.likeUser}>{post.user}</Text>
            </View>
            <View style={styles.likeBirdTag}>
              <MaterialCommunityIcons name="bird" size={12} color={Colors.springMoss} />
              <Text style={styles.likeBirdName}>{post.bird}</Text>
            </View>
          </View>
          <View style={styles.likeCountRow}>
            <Ionicons name="heart" size={14} color={Colors.errorRed} />
            <Text style={styles.likeCount}>{post.likes}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  // Profile header
  profileHeader: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  avatarWrapper: { position: 'relative', marginBottom: Spacing.md },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: Colors.canvasPure,
    borderRadius: 12,
  },
  name: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  professionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.springMoss + '30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
    gap: 4,
  },
  professionText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semiBold,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: Spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.componentBase },
  bio: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.sm,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.componentBase,
    backgroundColor: Colors.surface,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textSecondary,
  },
  activeTabText: { color: Colors.primary },

  // Sightings grid
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
  gridImage: { width: '100%', height: '100%' },
  locationBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Logbook
  logbookContainer: { padding: Spacing.md },
  logbookSummary: {
    flexDirection: 'row',
    backgroundColor: Colors.canvasPure,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  logbookStat: { flex: 1, alignItems: 'center', gap: 4 },
  logbookStatValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  logbookStatLabel: { fontSize: 10, color: Colors.textSecondary },
  logbookStatDivider: { width: 1, backgroundColor: Colors.componentBase, marginVertical: 4 },
  logbookSectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // Stamps grid (2 columns)
  stampsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  stampCard: {
    width: (width - Spacing.md * 2 - Spacing.md) / 2 - 0.5,
    backgroundColor: Colors.canvasPure,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    ...Shadows.card,
  },
  stampImageWrap: {
    width: '100%',
    height: 120,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: Colors.componentBase,
  },
  stampImageRare: {
    borderColor: Colors.tertiaryBrown + '80',
    borderWidth: 2,
  },
  stampImage: { width: '100%', height: '100%' },
  rareBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.tertiaryBrown,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  perfTop: {
    position: 'absolute',
    top: -5,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  perfBottom: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  perfDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.surface,
  },
  stampName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  stampScientific: {
    fontSize: 9,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },
  stampCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
    backgroundColor: Colors.componentBase,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stampCount: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },

  // Likes
  likesContainer: { padding: Spacing.md, gap: Spacing.md },
  likeCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
    ...Shadows.card,
  },
  likeImage: { width: '100%', height: '100%' },
  likeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: 'rgba(21,66,18,0.6)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeAvatar: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: Colors.springMoss },
  likeUser: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.canvasPure,
  },
  likeBirdTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  likeBirdName: {
    fontSize: 10,
    color: Colors.springMoss,
    fontWeight: Typography.fontWeight.medium,
  },
  likeCountRow: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  likeCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.canvasPure,
    fontWeight: Typography.fontWeight.bold,
  },
});
