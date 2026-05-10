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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Typography, Spacing, Radius, Shadows } from '../../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../../components/TopNavBar';
import BottomNavBar from '../../components/BottomNavBar';
import { createStyles } from '../../styles/screens/social/profileScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

type ProfileRouteProp = RouteProp<RootStackParamList, 'Profile'>;

// ── Datos de ejemplo ──────────────────────────────────────────────────────────
const OTHER_USERS_MOCK: Record<string, any> = {
  '1': { name: 'Carlos Mendez', username: 'carlos_m', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', isPrivate: true, bio: 'Nature lover & bird photographer.', followers: '2.1k', following: '120', sightings: '0' },
  '2': { name: 'Elena Rios', username: 'elena_bird', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300', isPrivate: false, bio: 'Finding peace in the forest.', followers: '1.2k', following: '842', sightings: '82' },
};

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

const FOLLOWERS_MOCK = [
  { id: '1', name: 'Carlos Mendez', username: 'carlos_m', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', isFollowing: true },
  { id: '2', name: 'Elena Rios',    username: 'elena_bird', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', isFollowing: false },
  { id: '3', name: 'Mike Thompson', username: 'mike_th', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100', isFollowing: true },
  { id: '4', name: 'Sarah Jenkins', username: 'sarah_j', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100', isFollowing: false },
];

const FOLLOWING_MOCK = [
  { id: '1', name: 'David Park',    username: 'david_p', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100', isFollowing: true },
  { id: '2', name: 'Anna K.',       username: 'anna_k', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100', isFollowing: true },
  { id: '3', name: 'John Doe',      username: 'johndoe', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100', isFollowing: true },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────
type Tab = 'Sightings' | 'Logbook' | 'Likes';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProfileRouteProp>();
  const { shared, screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const userId = route.params?.userId;
  const isMe = !userId || userId === 'me';
  
  // Get user data
  const userData = isMe ? {
    name: 'Ana Ruiz',
    username: 'anaruiz_bird',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    bio: 'Passionate ornithologist exploring the Baja peninsula. Focused on coastal species and conservation. 🌿📸',
    isPrivate: false,
    followers: '1.2k',
    following: '842',
    sightings: '82',
    profession: 'Professional Birder'
  } : (OTHER_USERS_MOCK[userId] || OTHER_USERS_MOCK['1']);

  const [activeTab, setActiveTab] = useState<Tab>('Sightings');
  const [followModalVisible, setFollowModalVisible] = useState(false);
  const [followModalType, setFollowModalType] = useState<'Followers' | 'Following'>('Followers');

  const openFollowModal = (type: 'Followers' | 'Following') => {
    setFollowModalType(type);
    setFollowModalVisible(true);
  };

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <TopNavBar />

      {/* ── Profile Header (fijo, no scroll) ── */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: userData.avatar }}
            style={styles.avatar}
          />
          {isMe && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.name}>{userData.name}</Text>
          {isMe && (
            <TouchableOpacity 
              style={styles.editIconBtn}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.professionBadge}>
          <MaterialCommunityIcons name="leaf" size={14} color={colors.primary} />
          <Text style={styles.professionText}>{userData.profession || 'Bird Watcher'}</Text>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem} onPress={() => openFollowModal('Followers')}>
            <Text style={styles.statValue}>{userData.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => openFollowModal('Following')}>
            <Text style={styles.statValue}>{userData.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => !userData.isPrivate && setActiveTab('Logbook')}>
            <Text style={styles.statValue}>{isMe ? LOGBOOK_ENTRIES.length : '0'}</Text>
            <Text style={styles.statLabel}>Species</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => !userData.isPrivate && setActiveTab('Sightings')}>
            <Text style={styles.statValue}>{userData.sightings}</Text>
            <Text style={styles.statLabel}>Sightings</Text>
          </TouchableOpacity>
        </View>

        {!isMe && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.followMainBtn}>
              <Text style={styles.followMainBtnText}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageMainBtn} onPress={() => navigation.navigate('Chat', { thread: { id: userId, name: userData.name, avatar: userData.avatar, lastMessage: '', time: '' } })}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.bio}>{userData.bio}</Text>
      </View>

      {userData.isPrivate && !isMe ? (
        <View style={styles.privateContainer}>
          <View style={styles.privateIconCircle}>
            <Ionicons name="lock-closed-outline" size={40} color={colors.textSecondary} />
          </View>
          <Text style={styles.privateTitle}>This Account is Private</Text>
          <Text style={styles.privateSubtitle}>Follow this account to see their sightings and activity.</Text>
        </View>
      ) : (
        <>
          {/* ── Tab bar horizontal ── */}
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
        </>
      )}

      {/* ── Follow Modal ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={followModalVisible}
        onRequestClose={() => setFollowModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{followModalType}</Text>
              <TouchableOpacity onPress={() => setFollowModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={followModalType === 'Followers' ? FOLLOWERS_MOCK : FOLLOWING_MOCK}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.followItem}
                  onPress={() => {
                    setFollowModalVisible(false);
                    navigation.navigate('Profile', { userId: item.id });
                  }}
                >
                  <Image source={{ uri: item.avatar }} style={styles.followAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.followName}>{item.name}</Text>
                    <Text style={styles.followUsername}>@{item.username}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.followBtn, item.isFollowing && styles.followingBtn]}
                    onPress={(e) => {
                      e.stopPropagation(); // Don't trigger the profile navigation
                      // Handle follow toggle
                    }}
                  >
                    <Text style={[styles.followBtnText, item.isFollowing && styles.followingBtnText]}>
                      {item.isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <BottomNavBar />
    </SafeAreaView>
  );
}

// ── Sightings grid ────────────────────────────────────────────────────────────
function SightingsGrid() {
  const { screen: styles, colors } = useDynamicStyles(createStyles);
  return (
    <View style={styles.grid}>
      {SIGHTING_PHOTOS.map((item, i) => (
        <TouchableOpacity key={i} style={styles.gridItem} activeOpacity={0.85}>
          <Image source={{ uri: item.uri }} style={styles.gridImage} />
          <View style={styles.locationBadge}>
            <Ionicons name="location" size={11} color={colors.white} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Logbook ───────────────────────────────────────────────────────────────────
function LogbookView() {
  const { screen: styles, colors } = useDynamicStyles(createStyles);
  const totalSpecies = LOGBOOK_ENTRIES.length;
  const rareCount    = LOGBOOK_ENTRIES.filter((e) => e.rare).length;
  const totalSightings = LOGBOOK_ENTRIES.reduce((sum, e) => sum + e.count, 0);

  return (
    <View style={styles.logbookContainer}>

      {/* Summary bar */}
      <View style={styles.logbookSummary}>
        <View style={styles.logbookStat}>
          <MaterialCommunityIcons name="bird" size={22} color={colors.primary} />
          <Text style={styles.logbookStatValue}>{totalSpecies}</Text>
          <Text style={styles.logbookStatLabel}>Species</Text>
        </View>
        <View style={styles.logbookStatDivider} />
        <View style={styles.logbookStat}>
          <MaterialCommunityIcons name="star-outline" size={22} color={colors.tertiaryBrown} />
          <Text style={styles.logbookStatValue}>{rareCount}</Text>
          <Text style={styles.logbookStatLabel}>Rare</Text>
        </View>
        <View style={styles.logbookStatDivider} />
        <View style={styles.logbookStat}>
          <Ionicons name="eye-outline" size={22} color={colors.secondaryBlue} />
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
                  <MaterialCommunityIcons name="star" size={10} color={colors.canvasPure} />
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
              <Ionicons name="eye-outline" size={11} color={colors.textSecondary} />
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
  const { screen: styles, colors } = useDynamicStyles(createStyles);
  return (
    <View style={styles.grid}>
      {LIKED_POSTS.map((post) => (
        <TouchableOpacity key={post.id} style={styles.gridItem} activeOpacity={0.85}>
          <Image source={{ uri: post.image }} style={styles.gridImage} />
          <View style={styles.likeHeartBadge}>
            <Ionicons name="heart" size={11} color={colors.errorRed} />
            <Text style={styles.likeGridCount}>{post.likes}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

