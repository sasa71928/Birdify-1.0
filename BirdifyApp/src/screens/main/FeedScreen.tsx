import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, StatusBar, RefreshControl, ActivityIndicator, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme';
import FeedItem, { Post } from '../../components/FeedItem';
import TopNavBar from '../../components/TopNavBar';
import { createStyles } from '../../styles/screens/main/feedScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { SightingRepository } from '../../repositories/sighting.repository';
import { Sighting } from '../../types/models';

function mapSightingToPost(sighting: Sighting): Post {
  const timeDiff = Date.now() - new Date(sighting.created_at).getTime();
  const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
  const timeAgoStr = hoursAgo < 24 
    ? (hoursAgo === 0 ? 'Hace un momento' : `Hace ${hoursAgo} hora${hoursAgo === 1 ? '' : 's'}`) 
    : `Hace ${Math.floor(hoursAgo/24)} día${Math.floor(hoursAgo/24) === 1 ? '' : 's'}`;

  return {
    id: sighting.id,
    username: sighting.user?.username || 'Usuario',
    userAvatar: sighting.user?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
    location: sighting.is_location_private ? 'Ubicación Privada' : 'En la Naturaleza', // Idealmente usar Reverse-Geocoding en el futuro
    image: sighting.photo_url || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600',
    tag: sighting.bird?.common_name || 'Ave Sin Identificar',
    likes: 0, // Pendiente de sistema de reacciones
    comments: 0, // Pendiente de sistema de comentarios
    caption: sighting.description || '',
    timeAgo: timeAgoStr,
    isVerified: sighting.user?.is_verified || false,
    commentsList: [] // Pendiente de sistema de subcomentarios
  };
}

export default function FeedScreen() {
  const { shared, screen, isDark, colors } = useDynamicStyles(createStyles);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadFeed = async () => {
    try {
      const sightings = await SightingRepository.getFeed();
      const mappedPosts = sightings.map(mapSightingToPost);
      setPosts(mappedPosts);
    } catch (error) {
      console.error('Error cargando el feed:', error);
    }
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

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <TopNavBar />
      
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : posts.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
            Aún no hay avistamientos en la comunidad. ¡Sé el primero en compartir uno!
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => <FeedItem post={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={screen.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={onRefresh} 
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

