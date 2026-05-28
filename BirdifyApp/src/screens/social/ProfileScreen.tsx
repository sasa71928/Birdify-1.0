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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Typography, Spacing, Radius, Shadows, Colors } from '../../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../../components/TopNavBar';
import BottomNavBar from '../../components/BottomNavBar';
import FeedItem, { Post } from '../../components/FeedItem';
import { createStyles } from '../../styles/screens/social/profileScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { ProfileRepository } from '../../repositories/profile.repository';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { User } from '../../types/models';
import { supabase } from '../../lib/supabase';
import { FollowRepository } from '../../repositories/follow.repository';

type ProfileRouteProp = RouteProp<RootStackParamList, 'Profile'>;

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
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [sightings, setSightings] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [species, setSpecies] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [canViewPrivateContent, setCanViewPrivateContent] = useState(isMe);
  const [togglingFollow, setTogglingFollow] = useState(false);
  const [togglingModalUserId, setTogglingModalUserId] = useState<string | null>(null);

  // States for dynamic followers/following list inside modal
  const [modalUsersList, setModalUsersList] = useState<any[]>([]);
  const [loadingModalUsers, setLoadingModalUsers] = useState(false);

  // States for sighting modal
  const [selectedSighting, setSelectedSighting] = useState<any>(null);
  const [showSightingModal, setShowSightingModal] = useState(false);

  const handleSightingPress = (sighting: any) => {
    setSelectedSighting(sighting);
    setShowSightingModal(true);
  };

  const handlePostDeleted = async () => {
    setShowSightingModal(false);
    // Recargar los avistamientos del perfil
    if (displayUserId) {
      const { data: sightingsData } = await supabase
        .from('sightings')
        .select(`
          id,
          description,
          photo_url,
          created_at,
          sighting_date,
          is_location_private,
          bird:birds (id, common_name, scientific_name)
        `)
        .eq('user_id', displayUserId)
        .order('created_at', { ascending: false });

      setSightings(sightingsData || []);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    async function loadProfileAndActivity() {
      if (!displayUserId) return;
      try {
        if (!isMounted) return;
        setProfile(null);
        setSightings([]);
        setLikes([]);
        setSpecies([]);
        setFollowersCount(0);
        setFollowingCount(0);
        setIsFollowingUser(false);
        setCanViewPrivateContent(isMe);
        setLoadingProfile(true);

        // 1. Cargar Perfil
        const data = await ProfileRepository.getById(displayUserId);
        if (!isMounted) return;
        if (data) {
          setProfile(data);
        }

        // 2. Cargar Seguidores/Seguidos
        const { count: fersCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', displayUserId);

        const { count: fingCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', displayUserId);

        if (!isMounted) return;
        setFollowersCount(fersCount || 0);
        setFollowingCount(fingCount || 0);

        // 3. Verificar si el usuario actual sigue a este perfil
        if (authUser && displayUserId && !isMe) {
          const isFollowing = await FollowRepository.isFollowing(authUser.id, displayUserId);
          if (!isMounted) return;
          setIsFollowingUser(isFollowing);
        }

        // 4. Determinar si se puede ver contenido privado (perfil privado requiere follow mutuo)
        let canViewActivity = true;
        if (data?.is_private && !isMe) {
          if (!authUser) {
            canViewActivity = false;
          } else {
            canViewActivity = await FollowRepository.areMutualFollowers(authUser.id, displayUserId);
          }
        }

        if (!isMounted) return;
        setCanViewPrivateContent(canViewActivity);

        if (!canViewActivity) {
          setSightings([]);
          setSpecies([]);
          setLikes([]);
          return;
        }

        // 5. Cargar Avistamientos Reales
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

        if (!isMounted) return;
        if (sightingsError) throw sightingsError;
        setSightings(sightingsData || []);

        // 6. Procesar Especies (Logbook) a partir de los avistamientos reales
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
        if (!isMounted) return;
        setSpecies(Array.from(speciesMap.values()));

        // 7. Cargar Likes (Reacciones)
        const { data: reactionsData, error: reactionsError } = await supabase
          .from('reactions')
          .select(`
            sighting:sightings (
              id,
              photo_url,
              users!sightings_user_id_fkey (username)
            )
          `)
          .eq('user_id', displayUserId);

        if (!isMounted) return;
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

      } catch (error) {
        if (!isMounted) return;
        console.error('Error cargando perfil y actividad:', error);
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    }
    if (isFocused) {
      loadProfileAndActivity();
    }

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [displayUserId, isFocused, authUser, isMe]);

  const handleFollowToggle = async () => {
    if (!authUser || !displayUserId || togglingFollow) return;
    try {
      setTogglingFollow(true);
      if (isFollowingUser) {
        await FollowRepository.unfollow(authUser.id, displayUserId);
        setIsFollowingUser(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await FollowRepository.follow(authUser.id, displayUserId);
        setIsFollowingUser(true);
        setFollowersCount(prev => prev + 1);
      }
      if (profile?.is_private) {
        const canView = await FollowRepository.areMutualFollowers(authUser.id, displayUserId);
        setCanViewPrivateContent(canView);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setTogglingFollow(false);
    }
  };

  const handleModalFollowToggle = async (targetUser: any) => {
    if (!authUser || togglingModalUserId) return;
    try {
      setTogglingModalUserId(targetUser.id);
      if (targetUser.isFollowing) {
        await FollowRepository.unfollow(authUser.id, targetUser.id);
        setModalUsersList(prev => prev.map(u => {
          if (u.id === targetUser.id) {
            return { ...u, isFollowing: false };
          }
          return u;
        }));
        if (isMe && followModalType === 'Following') {
          setFollowingCount(prev => Math.max(0, prev - 1));
        }
      } else {
        await FollowRepository.follow(authUser.id, targetUser.id);
        setModalUsersList(prev => prev.map(u => {
          if (u.id === targetUser.id) {
            return { ...u, isFollowing: true };
          }
          return u;
        }));
        if (isMe && followModalType === 'Following') {
          setFollowingCount(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Error toggling follow in modal:', err);
    } finally {
      setTogglingModalUserId(null);
    }
  };

  // Get user data
  // Updated userData with verification flag
const userData = profile ? {
  name: profile.fullname || 'Usuario',
  username: profile.username || 'user',
  avatar: profile.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
  bio: profile.bio || 'Sin biografía.',
  isPrivate: profile.is_private,
  is_verified: profile.is_verified ?? false,
  followers: followersCount.toString(),
  following: followingCount.toString(),
  sightings: sightings.length.toString(),
  profession: profile.user_level === 'admin' ? 'Administrador' : 'Bird Watcher',
} : {
  name: 'Cargando...',
  username: '...',
  avatar: 'https://gravatar.com/avatar/?d=mp',
  bio: '',
  isPrivate: false,
  is_verified: false,
  followers: '0',
  following: '0',
  sightings: '0',
  profession: '...'
};

  const [activeTab, setActiveTab] = useState<Tab>('Sightings');
  const [followModalVisible, setFollowModalVisible] = useState(false);
  const [followModalType, setFollowModalType] = useState<'Followers' | 'Following'>('Followers');

  const openFollowModal = async (type: 'Followers' | 'Following') => {
    setFollowModalType(type);
    setFollowModalVisible(true);
    if (!displayUserId) return;
    try {
      setLoadingModalUsers(true);
      setModalUsersList([]);
      let list: any[] = [];
      if (type === 'Followers') {
        list = await FollowRepository.getFollowers(displayUserId);
      } else {
        list = await FollowRepository.getFollowing(displayUserId);
      }
      
      const mappedList = await Promise.all(list.map(async (u) => {
        let isFollowing = false;
        if (authUser && u.id !== authUser.id) {
          isFollowing = await FollowRepository.isFollowing(authUser.id, u.id);
        }
        
        return {
          id: u.id,
          name: u.fullname || u.username || 'Usuario',
          username: u.username || 'user',
          avatar: u.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
          isFollowing
        };
      }));
      setModalUsersList(mappedList);
    } catch (err) {
      console.error('Error loading modal users:', err);
    } finally {
      setLoadingModalUsers(false);
    }
  };

  if (loadingProfile) {
    return (
      <SafeAreaView style={shared.safe}>
        <TopNavBar />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <BottomNavBar />
      </SafeAreaView>
    );
  }

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
            {userData.is_verified === true && (
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

        {userData.is_verified === true && (
          <View style={styles.verificationBadge}>
            <MaterialCommunityIcons name="shield-check" size={14} color={colors.primary} />
            <Text style={styles.verificationText}>Verificado</Text>
          </View>
        )}

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
            <TouchableOpacity 
              style={[styles.followMainBtn, isFollowingUser && { backgroundColor: colors.border + '30' }]}
              onPress={handleFollowToggle}
              disabled={togglingFollow}
            >
              {togglingFollow ? (
                <ActivityIndicator size="small" color={isFollowingUser ? colors.textSecondary : colors.white} />
              ) : (
                <Text style={[styles.followMainBtnText, isFollowingUser && { color: colors.textSecondary }]}>
                  {isFollowingUser ? 'Following' : 'Follow'}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageMainBtn} onPress={async () => {
              try {
                const conversationId = await ConversationRepository.createDirectConversation(authUser!.id, displayUserId!);
                navigation.navigate('Chat', { conversationId });
              } catch (error) {
                console.error('Error creating conversation:', error);
                Alert.alert('Error', 'No se pudo crear la conversación.');
              }
            }}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.bio}>{userData.bio}</Text>
      </View>


      {userData.isPrivate && !isMe && !canViewPrivateContent ? (
        <View style={styles.privateContainer}>
          <View style={styles.privateIconCircle}>
            <Ionicons name="lock-closed-outline" size={40} color={colors.textSecondary} />
          </View>
          <Text style={styles.privateTitle}>This Account is Private</Text>
          <Text style={styles.privateSubtitle}>Deben seguirse mutuamente para ver sightings, logbook y likes.</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
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
            {activeTab === 'Sightings' && <SightingsGrid sightings={sightings} onItemPress={handleSightingPress} />}
            {activeTab === 'Logbook'   && <LogbookView species={species} />}
            {activeTab === 'Likes'     && <LikesView likes={likes} />}
          </ScrollView>
        </View>
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
            
            {loadingModalUsers ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={modalUsersList}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                      No hay usuarios para mostrar.
                    </Text>
                  </View>
                }
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
                    
                    {authUser && item.id !== authUser.id && (
                      <TouchableOpacity 
                        style={[styles.followBtn, item.isFollowing && styles.followingBtn]}
                        onPress={(e) => {
                          e.stopPropagation(); // Evitar navegación de perfil
                          handleModalFollowToggle(item);
                        }}
                        disabled={togglingModalUserId === item.id}
                      >
                        {togglingModalUserId === item.id ? (
                          <ActivityIndicator size="small" color={item.isFollowing ? colors.textSecondary : colors.white} />
                        ) : (
                          <Text style={[styles.followBtnText, item.isFollowing && styles.followingBtnText]}>
                            {item.isFollowing ? 'Following' : 'Follow'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* ── Sighting Modal ── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSightingModal}
        onRequestClose={() => setShowSightingModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
          <TouchableOpacity
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={1}
            onPress={() => setShowSightingModal(false)}
          >
            {selectedSighting && (
              <FeedItem post={mapSightingToPost(selectedSighting, authUser?.id)} onPostDeleted={handlePostDeleted} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }}
            onPress={() => setShowSightingModal(false)}
          >
            <Ionicons name="close-circle" size={36} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </Modal>

      <BottomNavBar />
    </SafeAreaView>
);

// ── mapSightingToPost ─────────────────────────────────────────────────────────
function mapSightingToPost(sighting: any, currentUserId?: string): Post {
  const timeDiff = Date.now() - new Date(sighting.created_at || sighting.sighting_date).getTime();
  const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
  const timeAgoStr = hoursAgo < 24
    ? (hoursAgo === 0 ? 'Hace un momento' : `Hace ${hoursAgo} hora${hoursAgo === 1 ? '' : 's'}`)
    : `Hace ${Math.floor(hoursAgo/24)} día${Math.floor(hoursAgo/24) === 1 ? '' : 's'}`;

  let photoUrl: string | string[] = sighting.photo_url || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600';

  if (typeof photoUrl === 'string') {
    try {
      const parsed = JSON.parse(photoUrl);
      if (Array.isArray(parsed)) {
        photoUrl = parsed;
      }
    } catch {
      // Es una URL simple, no un JSON
    }
  }

  return {
    id: sighting.id,
    userId: sighting.user_id,
    username: sighting.user?.username || 'Usuario',
    userAvatar: sighting.user?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
    location: sighting.is_location_private ? 'Ubicación privada' : 'Ubicación del mapa',
    image: photoUrl,
    tag: sighting.bird?.common_name || 'Ave desconocida',
    likes: 0,
    comments: 0,
    caption: sighting.description || '',
    timeAgo: timeAgoStr,
    hasLiked: false,
    createdAt: sighting.created_at || sighting.sighting_date
  };
}

// ── Sightings grid ────────────────────────────────────────────────────────────
function SightingsGrid({ sightings, onItemPress }: { sightings: any[], onItemPress?: (sighting: any) => void }) {
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
        <TouchableOpacity key={item.id} style={styles.gridItem} activeOpacity={0.85} onPress={() => onItemPress?.(item)}>
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
}
