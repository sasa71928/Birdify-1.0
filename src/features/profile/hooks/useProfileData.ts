import { useState, useEffect, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../../../lib/supabase';
import { ProfileRepository } from '../../../repositories/profile.repository';
import { FollowRepository } from '../../../repositories/follow.repository';
import { User } from '../../../types/models';
import { handleError } from '../../../utils/errorHandler';

export function useProfileData(authUser: any, userId?: string) {
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

  const [modalUsersList, setModalUsersList] = useState<any[]>([]);
  const [loadingModalUsers, setLoadingModalUsers] = useState(false);
  const [followModalVisible, setFollowModalVisible] = useState(false);
  const [followModalType, setFollowModalType] = useState<'Followers' | 'Following'>('Followers');

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const loadProfileAndActivity = useCallback(async () => {
    if (!displayUserId) return;
    try {
      setLoadingProfile(true);

      // 1. Cargar Perfil
      const data = await ProfileRepository.getById(displayUserId);
      if (data) setProfile(data);

      // 2. Cargar Seguidores / Seguidos
      const [{ count: fersCount }, { count: fingCount }] = await Promise.all([
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', displayUserId),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', displayUserId),
      ]);

      setFollowersCount(fersCount || 0);
      setFollowingCount(fingCount || 0);

      // 3. Verificar si el usuario actual sigue a este perfil
      if (authUser && displayUserId && !isMe) {
        const isFollowing = await FollowRepository.isFollowing(authUser.id, displayUserId);
        setIsFollowingUser(isFollowing);
      }

      // 4. Determinar si se puede ver contenido privado
      let canViewActivity = true;
      if (data?.is_private && !isMe) {
        if (!authUser) {
          canViewActivity = false;
        } else {
          canViewActivity = await FollowRepository.areMutualFollowers(authUser.id, displayUserId);
        }
      }

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
          user_id,
          description,
          photo_url,
          latitude,
          longitude,
          sighting_date,
          is_location_private,
          created_at,
          users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
          bird:birds (id, common_name, scientific_name),
          reactions (user_id),
          comments (id)
        `)
        .eq('user_id', displayUserId)
        .order('created_at', { ascending: false });

      if (sightingsError) throw sightingsError;
      setSightings(sightingsData || []);

      // 6. Procesar Especies (Logbook)
      const speciesMap = new Map<string, any>();
      (sightingsData || []).forEach((item: any) => {
        if (item.bird) {
          const birdId = item.bird.id;
          const existing = speciesMap.get(birdId);

          let photoUrls: string[] = [];
          if (item.photo_url) {
            if (typeof item.photo_url === 'string') {
              try {
                const parsed = JSON.parse(item.photo_url);
                photoUrls = Array.isArray(parsed) ? parsed : [item.photo_url];
              } catch {
                photoUrls = [item.photo_url];
              }
            } else if (Array.isArray(item.photo_url)) {
              photoUrls = item.photo_url;
            }
          }

          const sightingDate = new Date(item.sighting_date || item.created_at).toLocaleDateString();

          if (existing) {
            existing.count += 1;
            photoUrls.forEach((url) => {
              existing.images.push({
                url,
                date: sightingDate,
                sightingId: item.id,
              });
            });
          } else {
            speciesMap.set(birdId, {
              id: birdId,
              name: item.bird.common_name,
              scientificName: item.bird.scientific_name,
              image: 'bird-icon',
              count: 1,
              date: sightingDate,
              rare: false,
              images: photoUrls.map((url) => ({
                url,
                date: sightingDate,
                sightingId: item.id,
              })),
            });
          }
        }
      });
      setSpecies(Array.from(speciesMap.values()));

      // 7. Cargar Likes (Reacciones)
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('reactions')
        .select(`
          sighting:sightings (
            id,
            user_id,
            description,
            photo_url,
            latitude,
            longitude,
            is_location_private,
            created_at,
            users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
            bird:birds (id, common_name, scientific_name),
            reactions (user_id),
            comments (id)
          )
        `)
        .eq('user_id', displayUserId);

      if (reactionsError) throw reactionsError;

      const mappedLikes = (reactionsData || [])
        .filter((r: any) => r.sighting)
        .map((r: any) => r.sighting);
      setLikes(mappedLikes);
    } catch (error) {
      handleError(error, setToast, 'Error al cargar perfil');
    } finally {
      setLoadingProfile(false);
    }
  }, [displayUserId, authUser, isMe]);

  useEffect(() => {
    if (isFocused) {
      loadProfileAndActivity();
    }
  }, [isFocused, loadProfileAndActivity]);

  const handleFollowToggle = async () => {
    if (!authUser || !displayUserId || togglingFollow) return;
    try {
      setTogglingFollow(true);
      if (isFollowingUser) {
        await FollowRepository.unfollow(authUser.id, displayUserId);
        setIsFollowingUser(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        await FollowRepository.follow(authUser.id, displayUserId);
        setIsFollowingUser(true);
        setFollowersCount((prev) => prev + 1);
      }
      if (profile?.is_private) {
        const canView = await FollowRepository.areMutualFollowers(authUser.id, displayUserId);
        setCanViewPrivateContent(canView);
      }
    } catch (error) {
      handleError(error, setToast, 'Error al seguir');
    } finally {
      setTogglingFollow(false);
    }
  };

  const openFollowModal = async (type: 'Followers' | 'Following') => {
    setFollowModalType(type);
    setFollowModalVisible(true);
    if (!displayUserId) return;
    try {
      setLoadingModalUsers(true);
      setModalUsersList([]);
      const list =
        type === 'Followers'
          ? await FollowRepository.getFollowers(displayUserId)
          : await FollowRepository.getFollowing(displayUserId);

      const myFollowingIds = authUser
        ? await FollowRepository.getFollowingIds(authUser.id)
        : new Set<string>();

      const mappedList = list.map((u) => ({
        id: u.id,
        name: u.fullname || u.username || 'Usuario',
        username: u.username || 'user',
        avatar: u.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
        isFollowing: Boolean(authUser && u.id !== authUser.id && myFollowingIds.has(u.id)),
      }));
      setModalUsersList(mappedList);
    } catch (err) {
      handleError(err, setToast, 'Error cargando usuarios');
    } finally {
      setLoadingModalUsers(false);
    }
  };

  const handleModalFollowToggle = async (targetUser: any) => {
    if (!authUser || togglingModalUserId) return;
    try {
      setTogglingModalUserId(targetUser.id);
      if (targetUser.isFollowing) {
        await FollowRepository.unfollow(authUser.id, targetUser.id);
        setModalUsersList((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, isFollowing: false } : u))
        );
        if (isMe && followModalType === 'Following') {
          setFollowingCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        await FollowRepository.follow(authUser.id, targetUser.id);
        setModalUsersList((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, isFollowing: true } : u))
        );
        if (isMe && followModalType === 'Following') {
          setFollowingCount((prev) => prev + 1);
        }
      }
    } catch (err) {
      handleError(err, setToast, 'Error');
    } finally {
      setTogglingModalUserId(null);
    }
  };

  const handlePostDeleted = async () => {
    if (displayUserId) {
      const { data: sightingsData } = await supabase
        .from('sightings')
        .select(`
          id,
          user_id,
          description,
          photo_url,
          latitude,
          longitude,
          created_at,
          sighting_date,
          is_location_private,
          users!sightings_user_id_fkey (id, username, fullname, profile_pic_url, is_verified),
          bird:birds (id, common_name, scientific_name),
          reactions (user_id),
          comments (id)
        `)
        .eq('user_id', displayUserId)
        .order('created_at', { ascending: false });

      setSightings(sightingsData || []);
    }
  };

  return {
    isMe,
    displayUserId,
    profile,
    loadingProfile,
    sightings,
    likes,
    species,
    followersCount,
    followingCount,
    isFollowingUser,
    canViewPrivateContent,
    togglingFollow,
    togglingModalUserId,
    modalUsersList,
    loadingModalUsers,
    followModalVisible,
    setFollowModalVisible,
    followModalType,
    toast,
    setToast,
    handleFollowToggle,
    openFollowModal,
    handleModalFollowToggle,
    handlePostDeleted,
  };
}

