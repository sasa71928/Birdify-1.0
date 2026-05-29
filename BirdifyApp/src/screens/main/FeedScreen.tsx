import React, { useCallback, useState, useRef, useEffect } from 'react';
import { FlatList, StyleSheet, StatusBar, RefreshControl, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import FeedItem, { Post } from '../../components/FeedItem';
import TopNavBar from '../../components/TopNavBar';
import AppToast from '../../components/AppToast';
import { createStyles } from '../../styles/screens/main/feedScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useFeed } from '../../hooks/useFeed';
import { useNewSightings } from '../../context/NewSightingsContext';

export default function FeedScreen() {
  const { shared, screen, isDark, colors } = useDynamicStyles(createStyles);
  
  const {
    posts,
    isLoading,
    isRefreshing,
    toast,
    setToast,
    handlePostDeleted,
    onRefresh,
  } = useFeed();

  const { hasNewPosts, newPostIds, clearNewPosts } = useNewSightings();
  const [showNewBanner, setShowNewBanner] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Mostrar banner instantáneamente cuando llegue un nuevo avistamiento
  useEffect(() => {
    if (hasNewPosts) {
      setShowNewBanner(true);
    }
  }, [hasNewPosts]);

  // Al entrar a Feed, verificar si hay nuevos avistamientos pendientes
  useFocusEffect(
    useCallback(() => {
      if (hasNewPosts) {
        setShowNewBanner(true);
      }
    }, [hasNewPosts])
  );

  const renderItem = useCallback(({ item }: { item: Post }) => (
    <FeedItem post={item} onPostDeleted={handlePostDeleted} isNew={newPostIds.has(item.id)} />
  ), [handlePostDeleted, newPostIds]);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const handleBannerPress = () => {
    setShowNewBanner(false);
    clearNewPosts();
    onRefresh();
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <TopNavBar />
      <AppToast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />
      
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
        <View style={{ flex: 1 }}>
          <FlatList
            ref={listRef}
            data={posts}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
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

          {showNewBanner && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 12,
                left: 16,
                right: 16,
                backgroundColor: colors.primary,
                borderRadius: 24,
                paddingVertical: 12,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                zIndex: 100,
              }}
              activeOpacity={0.85}
              onPress={handleBannerPress}
            >
              <Ionicons name="refresh" size={18} color={colors.white} />
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>
                Nuevo avistamiento — Recargar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

