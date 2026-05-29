import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, BirdSpeciesData } from '../navigation/AppNavigator';
import { SightingRepository } from '../repositories/sighting.repository';
import { useAuth } from '../context/AuthContext';
import FeedItem, { Post } from '../components/FeedItem';

type BirdDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'BirdDetail'>;
type BirdDetailRouteProp = RouteProp<RootStackParamList, 'BirdDetail'>;

function mapSightingToPost(sighting: any, currentUserId?: string): Post {
  const timeDiff = Date.now() - new Date(sighting.created_at).getTime();
  const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));

  const timeAgoStr =
    hoursAgo < 24
      ? hoursAgo === 0
        ? 'Hace un momento'
        : `Hace ${hoursAgo} hora${hoursAgo === 1 ? '' : 's'}`
      : `Hace ${Math.floor(hoursAgo / 24)} día${Math.floor(hoursAgo / 24) === 1 ? '' : 's'}`;

  const reactionsList = sighting.reactions || [];
  const likesCount = reactionsList.length;

  const hasLiked = currentUserId
    ? reactionsList.some((r: any) => r.user_id === currentUserId)
    : false;

  const userData = Array.isArray(sighting.user)
    ? sighting.user[0]
    : sighting.user;

  // Handle multiple images - photo_url can be a JSON string with array of URLs
  let imageUrl = sighting.photo_url || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600';
  
  // If photo_url is a string that looks like JSON, parse it
  if (typeof sighting.photo_url === 'string' && sighting.photo_url.startsWith('[')) {
    try {
      const parsedUrls = JSON.parse(sighting.photo_url);
      if (Array.isArray(parsedUrls) && parsedUrls.length > 0) {
        imageUrl = parsedUrls;
      }
    } catch (e) {
      // If parsing fails, use the original string
      imageUrl = sighting.photo_url;
    }
  }

  return {
    id: sighting.id,
    userId: sighting.user_id,
    username: userData?.username || 'Usuario',
    userAvatar: userData?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
    location: sighting.is_location_private
      ? 'Ubicación Privada'
      : 'En la Naturaleza',
    image: imageUrl,
    tag: sighting.bird?.common_name || 'Ave',
    likes: likesCount,
    comments: sighting.comments?.length || 0,
    caption: sighting.description || '',
    timeAgo: timeAgoStr,
    isVerified: userData?.is_verified === true,
    commentsList: [],
    hasLiked,
    createdAt: sighting.created_at
  };
}

export function useBirdDetail() {
  const navigation = useNavigation<BirdDetailNavProp>();
  const route = useRoute<BirdDetailRouteProp>();
  const bird = route.params?.bird;
  const { user } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const classification = bird?.classification;

  useEffect(() => {
    if (bird?.id) loadBirdSightings();
  }, [bird?.id]);

  const loadBirdSightings = async () => {
    try {
      setLoading(true);
      const sightings = await SightingRepository.getFeed(user?.id);
      const filtered = sightings.filter((item: any) => item.bird_id === bird?.id);
      const mapped = filtered.map((item: any) => mapSightingToPost(item, user?.id));
      setPosts(mapped);
    } catch (error) {
      console.error('Error loading sightings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = async () => {
    await loadBirdSightings();
  };

  const goBack = () => {
    navigation.goBack();
  };

  return {
    // State
    bird,
    posts,
    loading,
    classification,
    
    // Actions
    loadBirdSightings,
    handlePostDeleted,
    goBack,
  };
}
