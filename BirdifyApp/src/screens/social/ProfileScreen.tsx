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
  const [togglingFollow, setTogglingFollow] = useState(false);
  const [togglingModalUserId, setTogglingModalUserId] = useState<string | null>(null);
  const [openingChat, setOpeningChat] = useState(false); // ✅ NUEVO


  // States for dynamic followers/following list inside modal
  const [modalUsersList, setModalUsersList] = useState<any[]>([]);
  const [loadingModalUsers, setLoadingModalUsers] = useState(false);


  useEffect(() => {
    async function loadProfileAndActivity() {
      if (!displayUserId) return;
      try {
        setProfile(null);
        setSightings([]);
        setLikes([]);
        setSpecies([]);
        setFollowersCount(0);
        setFollowingCount(0);
        setIsFollowingUser(false);
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


        // 6. Verificar si el usuario actual sigue a este perfil
        if (authUser && displayUserId && !isMe) {
          const isFollowing = await FollowRepository.isFollowing(authUser.id, displayUserId);
          setIsFollowingUser(isFollowing);
        }


      } catch (error) {
        console.error('Error cargando perfil y actividad:', error);
      } finally {
        setLoadingProfile(false);
      }
    }
    if (isFocused) {
      loadProfileAndActivity();
    }
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


  //Abrir chat buscando/creando la conversación real
  const handleOpenChat = async () => {
  if (!authUser || !displayUserId || openingChat) return;
  try {
    setOpeningChat(true);

    // 1. Buscar conversaciones donde está el usuario actual
    const { data: myConvos } = await supabase
      .from('conversation_members') 
      .select('conversation_id')
      .eq('user_id', authUser.id);

    const myConvoIds = (myConvos || []).map((r: any) => r.conversation_id);

    // 2. Ver si el otro usuario comparte alguna de esas conversaciones
    const { data: sharedConvo } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', displayUserId)
      .in('conversation_id', myConvoIds.length ? myConvoIds : ['00000000-0000-0000-0000-000000000000']);

    let conversationId: string;

    if (sharedConvo && sharedConvo.length > 0) {
      conversationId = sharedConvo[0].conversation_id;
    } else {
      // 3. Crear nueva conversación
      const { data: created, error } = await supabase
        .from('conversations')
        .insert({ is_group: false })
        .select('id')
        .single();

      if (error) throw error;
      conversationId = created.id;

      // 4. Insertar los dos participantes
      await supabase.from('conversation_members').insert([
        { conversation_id: conversationId, user_id: authUser.id },
        { conversation_id: conversationId, user_id: displayUserId },
      ]);
    }

    navigation.navigate('Chat', {
      thread: {
        id: conversationId,
        name: userData.name,
        avatar: userData.avatar,
        lastMessage: '',
        time: '',
      },
    });
  } catch (err) {
    console.error('Error abriendo chat:', err);
  } finally {
    setOpeningChat(false);
  }
};


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
  } : {
    name: 'Cargando...',
    username: '...',
    avatar: 'https://gravatar.com/avatar/?d=mp',
    bio: '',
    isPrivate: false,
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

            {/* ✅ BOTÓN CORREGIDO */}
            <TouchableOpacity
              style={[styles.messageMainBtn, openingChat && { opacity: 0.6 }]}
              onPress={handleOpenChat}
              disabled={openingChat}
            >
              {openingChat ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
              )}
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
                          e.stopPropagation();
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
            <View style={[styles.stampImageWrap, entry.rare && styles.stampImageRare]}>
              <Image source={{ uri: entry.image }} style={styles.stampImage} />
              {entry.rare && (
                <View style={styles.rareBadge}>
                  <MaterialCommunityIcons name="star" size={10} color={colors.canvasPure} />
                </View>
              )}
              <View style={styles.perfTop}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <View key={i} style={styles.perfDot} />
                ))}
              </View>
              <View style={styles.perfBottom}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <View key={i} style={styles.perfDot} />
                ))}
              </View>
            </View>


            <Text style={styles.stampName} numberOfLines={1}>{entry.name}</Text>
            <Text style={styles.stampScientific} numberOfLines={1}>{entry.scientificName}</Text>


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