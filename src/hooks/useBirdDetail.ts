import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SightingRepository } from '../repositories/sighting.repository';
import { useAuth } from '../context/AuthContext';
import { Post } from '../components/FeedItem';
import { mapSightingToPost } from './useFeed';
import { handleError } from '../utils/errorHandler';

type BirdDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'BirdDetail'>;
type BirdDetailRouteProp = RouteProp<RootStackParamList, 'BirdDetail'>;

export function useBirdDetail() {
  const navigation = useNavigation<BirdDetailNavProp>();
  const route = useRoute<BirdDetailRouteProp>();
  const bird = route.params?.bird;
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const classification = bird?.classification;

  const loadBirdSightings = useCallback(async () => {
    if (!bird?.id) {
      setPosts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // AUD-020: Consulta dedicada por bird_id sin truncar a los últimos 20 posts globales
      const sightings = await SightingRepository.getByBirdId(bird.id, user?.id, 50);
      const mapped = sightings.map((item: any) => mapSightingToPost(item, user));
      setPosts(mapped);
    } catch (error) {
      handleError(error, setToast, 'Error loading sightings');
    } finally {
      setLoading(false);
    }
  }, [bird?.id, user]);

  useEffect(() => {
    loadBirdSightings();
  }, [loadBirdSightings]);

  const handlePostDeleted = async () => {
    await loadBirdSightings();
  };

  const goBack = () => {
    navigation.goBack();
  };

  return {
    bird,
    posts,
    loading,
    classification,
    toast,
    setToast,
    loadBirdSightings,
    handlePostDeleted,
    goBack,
  };
}
