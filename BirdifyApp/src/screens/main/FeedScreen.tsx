import React, { useCallback } from 'react';
import { FlatList, StyleSheet, StatusBar, RefreshControl, ActivityIndicator, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme';
import FeedItem, { Post } from '../../components/FeedItem';
import TopNavBar from '../../components/TopNavBar';
import AppToast from '../../components/AppToast';
import { createStyles } from '../../styles/screens/main/feedScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useFeed } from '../../hooks/useFeed';

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

  const renderItem = useCallback(({ item }: { item: Post }) => (
    <FeedItem post={item} onPostDeleted={handlePostDeleted} />
  ), [handlePostDeleted]);

  const keyExtractor = useCallback((item: Post) => item.id, []);

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
        <FlatList
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
      )}
    </SafeAreaView>
  );
}

