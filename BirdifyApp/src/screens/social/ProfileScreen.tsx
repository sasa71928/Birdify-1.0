import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Typography, Spacing, Radius, Shadows } from '../../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../../components/TopNavBar';
import BottomNavBar from '../../components/BottomNavBar';
import { createStyles } from '../../styles/screens/social/profileScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { ProfileRepository } from '../../repositories/profile.repository';
import { User } from '../../types/models';
import { supabase } from '../../lib/supabase';

type ProfileRouteProp = RouteProp<RootStackParamList, 'Profile'>;

// ── Datos de ejemplo ──────────────────────────────────────────────────────────
const OTHER_USERS_MOCK: Record<string, any> = {
  '1': { name: 'Carlos Mendez', username: 'carlos_m', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', isPrivate: true, bio: 'Nature lover & bird photographer.', followers: '2.1k', following: '120', sightings: '0' },
  '2': { name: 'Elena Rios', username: 'elena_bird', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300', isPrivate: false, bio: 'Finding peace in the forest.', followers: '1.2k', following: '842', sightings: '82' },
};

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
  
  const { user: authUser } = useAuth();
  const userId = route.params?.userId;
  const isMe = !userId || userId === 'me' || userId === authUser?.id;
  const displayUserId = isMe ? authUser?.id : userId;
  const isFocused = useIsFocused();

  const [profile, setProfile] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(isMe);
  const [sightings, setSightings] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [species, setSpecies] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    async function loadProfileAndActivity() {
      if (!displayUserId) return;
      try {
        setLoadingProfile(true);
        
        // 1. Cargar Perfil
        const data = await ProfileRepository.getById(displayUserId);
        if (data) {
          setProfile(data);
        }

        // 2. Cargar Avistamientos Reales
        const { data: sightingsData, error: sightingsError } = await supabase
          .from('sightings')
          .select(`
            id,
            description,
            photo_url,
            sighting_date,
            is_location_private,
            bird:birds (id, common_name, scientific_name)
          `)
          .eq('user_id', displayUserId)
          .order('created_at', { ascending: false });

        if (sightingsError) throw sightingsError;
        setSightings(sightingsData || []);

        // 3. Procesar Especies (Logbook) a partir de los avistamientos reales
        const speciesMap = new Map<string, any>();
        (sightingsData || []).forEach((item: any) => {
          if (item.bird) {
            const birdId = item.bird.id;
            const existing = speciesMap.get(birdId);
            if (existing) {
              existing.count += 1;
            } else {
              speciesMap.set(birdId, {
                id: birdId,
                name: item.bird.common_name,
                scientificName: item.bird.scientific_name,
                image: item.photo_url || 'https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=200',
                count: 1,
                date: new Date(item.sighting_date).toLocaleDateString(),
                rare: false
              });
            }
          }
        });
        setSpecies(Array.from(speciesMap.values()));

        // 4. Cargar Likes (Reacciones)
        const { data: reactionsData, error: reactionsError } = await supabase
          .from('reactions')
          .select(`
            sighting:sightings (
              id,
              photo_url,
              user:users!sightings_user_id_fkey (username)
            )
          `)
          .eq('user_id', displayUserId);

        if (reactionsError) throw reactionsError;
        
        const mappedLikes = (reactionsData || [])
          .filter((r: any) => r.sighting)
          .map((r: any) => ({
            id: r.sighting.id,
            image: r.sighting.photo_url,
            user: r.sighting.user?.username || 'user',
            likes: 1
          }));
        setLikes(mappedLikes);

        // 5. Cargar Seguidores/Seguidos
        const { count: fersCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', displayUserId);

        const { count: fingCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', displayUserId);

        setFollowersCount(fersCount || 0);
        setFollowingCount(fingCount || 0);

      } catch (error) {
        console.error('Error cargando perfil y actividad:', error);
      } finally {
        setLoadingProfile(false);
      }
    }
    if (isFocused) {
      loadProfileAndActivity();
    }
  }, [displayUserId, isFocused]);

  // Get user data
  const userData = profile ? {
    name: profile.fullname ||  'Usuario',
    username: profile.username || 'user',
    avatar: profile.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
    bio: profile.bio || 'Sin biografía.',
    isPrivate: profile.is_private,
    followers: followersCount.toString(),
    following: followingCount.toString(),
    sightings: sightings.length.toString(),
    profession: profile.user_level === 'admin' ? 'Administrador' : 'Bird Watcher'
  } : (isMe ? {
    name: 'Cargando...',
    username: '...',
    avatar: 'https://gravatar.com/avatar/?d=mp',
    bio: '',
    isPrivate: false,
    followers: '0',
    following: '0',
    sightings: '0',
    profession: '...'
  } : (OTHER_USERS_MOCK[userId!] || OTHER_USERS_MOCK['1']));

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

        <Text style={styles.usernameText}>@{userData.username}</Text>

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
            <Text style={styles.statValue}>{species.length}</Text>
            <Text style={styles.statLabel}>Species</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => !userData.isPrivate && setActiveTab('Sightings')}>
            <Text style={styles.statValue}>{sightings.length}</Text>
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
            {activeTab === 'Sightings' && <SightingsGrid sightings={sightings} />}
            {activeTab === 'Logbook'   && <LogbookView species={species} />}
            {activeTab === 'Likes'     && <LikesView likes={likes} />}
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
function SightingsGrid({ sightings }: { sightings: any[] }) {
  const { screen: styles, colors } = useDynamicStyles(createStyles);
  
  if (sightings.length === 0) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <Ionicons name="camera-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', fontFamily: 'PlusJakartaSans-Medium' }}>
          No has publicado ningún avistamiento aún.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {sightings.map((item) => (
        <TouchableOpacity key={item.id} style={styles.gridItem} activeOpacity={0.85}>
          <Image source={{ uri: item.photo_url || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=300' }} style={styles.gridImage} />
          <View style={styles.locationBadge}>
            <Ionicons name="location" size={11} color={colors.white} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Logbook ───────────────────────────────────────────────────────────────────
function LogbookView({ species }: { species: any[] }) {
  const { screen: styles, colors } = useDynamicStyles(createStyles);
  const totalSpecies = species.length;
  const rareCount    = species.filter((e) => e.rare).length;
  const totalSightings = species.reduce((sum, e) => sum + e.count, 0);

  if (species.length === 0) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <MaterialCommunityIcons name="bird" size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', fontFamily: 'PlusJakartaSans-Medium' }}>
          No has catalogado ninguna especie aún.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.logbookContainer}>

      {/* Summary bar */}
      <View style={styles.logbookSummary}>
        <View style={styles.logbookStat}>
          <MaterialCommunityIcons name="bird" size={22} color={colors.primary} />
          <Text style={styles.logbookStatValue}>{totalSpecies}</Text>
          <Text style={styles.logbookStatLabel}>Especies</Text>
        </View>
        <View style={styles.logbookStatDivider} />
        <View style={styles.logbookStat}>
          <MaterialCommunityIcons name="star-outline" size={22} color={colors.tertiaryBrown} />
          <Text style={styles.logbookStatValue}>{rareCount}</Text>
          <Text style={styles.logbookStatLabel}>Raras</Text>
        </View>
        <View style={styles.logbookStatDivider} />
        <View style={styles.logbookStat}>
          <Ionicons name="eye-outline" size={22} color={colors.secondaryBlue} />
          <Text style={styles.logbookStatValue}>{totalSightings}</Text>
          <Text style={styles.logbookStatLabel}>Avistamientos</Text>
        </View>
      </View>

      {/* Bird stamps */}
      <Text style={styles.logbookSectionTitle}>Estampas de Aves</Text>
      <View style={styles.stampsGrid}>
        {species.map((entry) => (
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
function LikesView({ likes }: { likes: any[] }) {
  const { screen: styles, colors } = useDynamicStyles(createStyles);

  if (likes.length === 0) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <Ionicons name="heart-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', fontFamily: 'PlusJakartaSans-Medium' }}>
          No has reaccionado a ningún avistamiento aún.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {likes.map((post) => (
        <TouchableOpacity key={post.id} style={styles.gridItem} activeOpacity={0.85}>
          <Image source={{ uri: post.image || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=300' }} style={styles.gridImage} />
          <View style={styles.likeHeartBadge}>
            <Ionicons name="heart" size={11} color={colors.errorRed} />
            <Text style={styles.likeGridCount}>{post.likes}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}



