import React, { useState, useEffect } from 'react';
import { SightingRepository } from '../repositories/sighting.repository';
import { useAuth } from '../context/AuthContext';
import FeedItem, { Post } from '../components/FeedItem';
import * as Location from 'expo-location';
import { handleError } from '../utils/errorHandler';

async function getCityFromCoordinates(latitude: number, longitude: number): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results && results.length > 0) {
      const city = results[0].city || results[0].subregion || results[0].region;
      return city || null;
    }
  } catch (error) {
    console.error('Error getting city from coordinates:', error);
  }
  return null;
}

async function mapSightingToPost(sighting: any, currentUserId?: string): Promise<Post> {
  const timeDiff = Date.now() - new Date(sighting.created_at).getTime();
  const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
  const timeAgoStr = hoursAgo < 24
    ? (hoursAgo === 0 ? 'Hace un momento' : `Hace ${hoursAgo} hora${hoursAgo === 1 ? '' : 's'}`)
    : `Hace ${Math.floor(hoursAgo/24)} día${Math.floor(hoursAgo/24) === 1 ? '' : 's'}`;

  const reactionsList = sighting.reactions || [];
  const likesCount = reactionsList.length;
  const hasLiked = currentUserId ? reactionsList.some((r: any) => r.user_id === currentUserId) : false;

  const userData = Array.isArray(sighting.user) ? sighting.user[0] : sighting.user;

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

  let locationText = 'Ubicación Privada';
  if (!sighting.is_location_private && sighting.latitude && sighting.longitude) {
    const city = await getCityFromCoordinates(sighting.latitude, sighting.longitude);
    const coords = `${sighting.latitude.toFixed(4)}, ${sighting.longitude.toFixed(4)}`;
    locationText = city ? `${city} (${coords})` : coords;
  }

  return {
    id: sighting.id,
    userId: sighting.user_id,
    username: userData?.username || 'Usuario',
    userAvatar: userData?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
    location: locationText,
    image: photoUrl,
    tag: sighting.bird?.common_name || 'Ave Sin Identificar',
    likes: likesCount,
    comments: sighting.comments ? sighting.comments.length : 0,
    caption: sighting.description || '',
    timeAgo: timeAgoStr,
    isVerified: userData?.is_verified === true,
    commentsList: [],
    hasLiked,
    createdAt: sighting.created_at,
    latitude: sighting.latitude,
    longitude: sighting.longitude,
  };
}

export function useFeed() {
  const { user } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const loadFeed = async () => {
    try {
      const sightings = await SightingRepository.getFeed(user?.id);
      const mappedPosts = await Promise.all(sightings.map(item => mapSightingToPost(item, user?.id)));
      setPosts(mappedPosts);
    } catch (error) {
      handleError(error, setToast, 'Error cargando el feed');
    }
  };

  const handlePostDeleted = async () => {
    await loadFeed();
  };

  const initialLoad = async () => {
    setIsLoading(true);
    await loadFeed();
    setIsLoading(false);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadFeed();
    setIsRefreshing(false);
  };

  useEffect(() => {
    initialLoad();
  }, []);

  return {
    posts,
    isLoading,
    isRefreshing,
    toast,
    setToast,
    loadFeed,
    handlePostDeleted,
    onRefresh,
  };
}
