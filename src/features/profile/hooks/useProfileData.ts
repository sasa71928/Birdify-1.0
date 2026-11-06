import { useState, useEffect, useCallback, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { ProfileRepository } from '../../../repositories/profile.repository';
import { FollowRepository } from '../../../repositories/follow.repository';
import { User } from '../../../types/models';
import { handleError } from '../../../utils/errorHandler';
import { ProfileTabType } from '../components/ProfileTabs';

const PROFILE_PAGE_LIMIT = 30;

function buildSpeciesFromSightings(sightingsData: any[]): any[] {
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
  return Array.from(speciesMap.values());
}

export function useProfileData(
  authUser: any,
  userId?: string,
  activeTab: ProfileTabType = 'Sightings',
) {
  const isMe = !userId || userId === 'me' || userId === authUser?.id;
  const displayUserId = isMe ? authUser?.id : userId;
  const isFocused = useIsFocused();

  const [profile, setProfile] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [sightings, setSightings] = useState<any[]>([]);
  const [sightingsPage, setSightingsPage] = useState(0);
  const [hasMoreSightings, setHasMoreSightings] = useState(false);
  const [loadingMoreSightings, setLoadingMoreSightings] = useState(false);

  const [likes, setLikes] = useState<any[]>([]);
  const [likesLoaded, setLikesLoaded] = useState(false);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [likesError, setLikesError] = useState<string | null>(null);
  const [likesPage, setLikesPage] = useState(0);
  const [hasMoreLikes, setHasMoreLikes] = useState(false);
  const [loadingMoreLikes, setLoadingMoreLikes] = useState(false);
  const likesInFlightRef = useRef(false);

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

  // Reiniciar el estado de Likes cuando cambie el perfil visitado
  useEffect(() => {
    setLikes([]);
    setLikesLoaded(false);
    setLoadingLikes(false);
    setLikesError(null);
    setLikesPage(0);
    setHasMoreLikes(false);
    likesInFlightRef.current = false;
  }, [displayUserId]);

  const fetchLikesTab = useCallback(
    async (force = false) => {
      if (!displayUserId || !canViewPrivateContent) return;
      if (likesInFlightRef.current) return;
      if (likesLoaded && !force) return;

      likesInFlightRef.current = true;
      setLoadingLikes(true);
      setLikesError(null);
      try {
        const { items: likedSightings, hasMore } = await ProfileRepository.getLikedSightings(
          displayUserId,
          authUser?.id,
          0,
          PROFILE_PAGE_LIMIT,
        );
        setLikes(likedSightings);
        setLikesPage(0);
        setHasMoreLikes(hasMore);
        setLikesLoaded(true);
      } catch (error) {
        setLikesError('No se pudieron cargar las publicaciones con Me gusta.');
        handleError(error, setToast, 'Error cargando likes del perfil');
      } finally {
        likesInFlightRef.current = false;
        setLoadingLikes(false);
      }
    },
    [displayUserId, canViewPrivateContent, likesLoaded, authUser?.id],
  );

  // Carga diferida de Likes únicamente cuando el usuario abre esa pestaña
  useEffect(() => {
    if (
      activeTab === 'Likes' &&
      !loadingProfile &&
      canViewPrivateContent &&
      !likesLoaded &&
      !loadingLikes &&
      !likesError
    ) {
      fetchLikesTab();
    }
  }, [
    activeTab,
    loadingProfile,
    canViewPrivateContent,
    likesLoaded,
    loadingLikes,
    likesError,
    fetchLikesTab,
  ]);

  const loadMoreSightings = useCallback(async () => {
    if (!displayUserId || !canViewPrivateContent || loadingMoreSightings || !hasMoreSightings) {
      return;
    }
    setLoadingMoreSightings(true);
    try {
      const nextPage = sightingsPage + 1;
      const { items: moreSightings, hasMore } = await ProfileRepository.getProfileSightings(
        displayUserId,
        authUser?.id,
        nextPage,
        PROFILE_PAGE_LIMIT,
      );
      setSightings((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const uniqueMore = moreSightings.filter((s: any) => !existingIds.has(s.id));
        const combined = [...prev, ...uniqueMore];
        setSpecies(buildSpeciesFromSightings(combined));
        return combined;
      });
      setSightingsPage(nextPage);
      setHasMoreSightings(hasMore);
    } catch (error) {
      handleError(error, setToast, 'Error cargando más avistamientos');
    } finally {
      setLoadingMoreSightings(false);
    }
  }, [
    displayUserId,
    canViewPrivateContent,
    loadingMoreSightings,
    hasMoreSightings,
    sightingsPage,
    authUser?.id,
  ]);

  const loadMoreLikes = useCallback(async () => {
    if (
      !displayUserId ||
      !canViewPrivateContent ||
      loadingMoreLikes ||
      !hasMoreLikes ||
      loadingLikes
    ) {
      return;
    }
    setLoadingMoreLikes(true);
    try {
      const nextPage = likesPage + 1;
      const { items: moreLikes, hasMore } = await ProfileRepository.getLikedSightings(
        displayUserId,
        authUser?.id,
        nextPage,
        PROFILE_PAGE_LIMIT,
      );
      setLikes((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const uniqueMore = moreLikes.filter((item: any) => !existingIds.has(item.id));
        return [...prev, ...uniqueMore];
      });
      setLikesPage(nextPage);
      setHasMoreLikes(hasMore);
    } catch (error) {
      handleError(error, setToast, 'Error cargando más likes');
    } finally {
      setLoadingMoreLikes(false);
    }
  }, [
    displayUserId,
    canViewPrivateContent,
    loadingMoreLikes,
    hasMoreLikes,
    loadingLikes,
    likesPage,
    authUser?.id,
  ]);

  const loadProfileAndActivity = useCallback(async () => {
    if (!displayUserId) return;
    try {
      setProfile(null);
      setSightings([]);
      setSightingsPage(0);
      setHasMoreSightings(false);
      setLikes([]);
      setLikesLoaded(false);
      setLoadingLikes(false);
      setLikesError(null);
      setLikesPage(0);
      setHasMoreLikes(false);
      likesInFlightRef.current = false;
      setSpecies([]);
      setFollowersCount(0);
      setFollowingCount(0);
      setIsFollowingUser(false);
      setCanViewPrivateContent(isMe);
      setLoadingProfile(true);

      // 1. Cargar resumen unificado de cabecera (RPC con fallback en paralelo)
      const summary = await ProfileRepository.getProfileSummary(
        displayUserId,
        authUser?.id,
      );

      setProfile(summary.profile);
      setFollowersCount(summary.followersCount);
      setFollowingCount(summary.followingCount);
      setIsFollowingUser(summary.isFollowing);
      setCanViewPrivateContent(summary.canViewContent);

      if (!summary.canViewContent) {
        setSightings([]);
        setSpecies([]);
        setLikes([]);
        return;
      }

      // 2. Cargar Avistamientos del perfil (con conteos agregados y reacciones propias en lote)
      const { items: sightingsData, hasMore } = await ProfileRepository.getProfileSightings(
        displayUserId,
        authUser?.id,
        0,
        PROFILE_PAGE_LIMIT,
      );

      setSightings(sightingsData);
      setSightingsPage(0);
      setHasMoreSightings(hasMore);

      // 3. Procesar Especies (Logbook)
      setSpecies(buildSpeciesFromSightings(sightingsData));
    } catch (error) {
      handleError(error, setToast, 'Error al cargar perfil');
    } finally {
      setLoadingProfile(false);
    }
  }, [displayUserId, authUser?.id, isMe]);

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
        if (canView && sightings.length === 0) {
          const { items: sightingsData, hasMore } = await ProfileRepository.getProfileSightings(
            displayUserId,
            authUser.id,
            0,
            PROFILE_PAGE_LIMIT,
          );
          setSightings(sightingsData);
          setSightingsPage(0);
          setHasMoreSightings(hasMore);
          setSpecies(buildSpeciesFromSightings(sightingsData));
        } else if (!canView) {
          setSightings([]);
          setSpecies([]);
          setLikes([]);
          setLikesLoaded(false);
        }
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

  const syncSightingLike = useCallback(
    (postId: string, liked: boolean, nextLikesCount: number, fallbackSighting?: any) => {
      setSightings((prev) =>
        prev.map((item) =>
          item.id === postId
            ? { ...item, has_liked: liked, likes_count: nextLikesCount }
            : item,
        ),
      );

      setLikes((prev) => {
        if (isMe) {
          if (!liked) {
            return prev.filter((item) => item.id !== postId);
          }
          const exists = prev.some((item) => item.id === postId);
          if (exists) {
            return prev.map((item) =>
              item.id === postId
                ? { ...item, has_liked: true, likes_count: nextLikesCount }
                : item,
            );
          }
          if (likesLoaded && fallbackSighting && fallbackSighting.id === postId) {
            return [
              { ...fallbackSighting, has_liked: true, likes_count: nextLikesCount },
              ...prev,
            ];
          }
          return prev;
        }
        return prev.map((item) =>
          item.id === postId
            ? { ...item, has_liked: liked, likes_count: nextLikesCount }
            : item,
        );
      });
    },
    [isMe, likesLoaded],
  );

  const syncSightingComment = useCallback((postId: string, nextCommentsCount: number) => {
    setSightings((prev) =>
      prev.map((item) =>
        item.id === postId ? { ...item, comments_count: nextCommentsCount } : item,
      ),
    );
    setLikes((prev) =>
      prev.map((item) =>
        item.id === postId ? { ...item, comments_count: nextCommentsCount } : item,
      ),
    );
  }, []);

  const handlePostDeleted = async (deletedId?: string) => {
    if (deletedId) {
      setSightings((prev) => {
        const next = prev.filter((item) => item.id !== deletedId);
        setSpecies(buildSpeciesFromSightings(next));
        return next;
      });
      setLikes((prev) => prev.filter((item) => item.id !== deletedId));
      return;
    }
    if (displayUserId) {
      try {
        const { items: sightingsData, hasMore } = await ProfileRepository.getProfileSightings(
          displayUserId,
          authUser?.id,
          0,
          PROFILE_PAGE_LIMIT,
        );
        setSightings(sightingsData);
        setSightingsPage(0);
        setHasMoreSightings(hasMore);
        setSpecies(buildSpeciesFromSightings(sightingsData));
      } catch (error) {
        handleError(error, setToast, 'Error recargando publicaciones');
      }
    }
  };

  return {
    isMe,
    displayUserId,
    profile,
    loadingProfile,
    sightings,
    hasMoreSightings,
    loadingMoreSightings,
    loadMoreSightings,
    likes,
    likesLoaded,
    loadingLikes,
    likesError,
    hasMoreLikes,
    loadingMoreLikes,
    loadMoreLikes,
    fetchLikesTab,
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
    syncSightingLike,
    syncSightingComment,
  };
}

