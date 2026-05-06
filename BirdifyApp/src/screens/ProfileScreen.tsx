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
import styles from '../styles/profileScreen.styles';

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

      {/* ── Profile Header (fijo, no scroll) ── */}
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

      {/* ── Tab bar horizontal (fijo) ── */}
      <View style={styles.tabsContainer}>
        {(['Sightings', 'Logbook', 'Likes'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Contenido scrollable del tab activo ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
    <View style={styles.grid}>
      {LIKED_POSTS.map((post) => (
        <TouchableOpacity key={post.id} style={styles.gridItem} activeOpacity={0.85}>
          <Image source={{ uri: post.image }} style={styles.gridImage} />
          <View style={styles.likeHeartBadge}>
            <Ionicons name="heart" size={11} color={Colors.errorRed} />
            <Text style={styles.likeGridCount}>{post.likes}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
