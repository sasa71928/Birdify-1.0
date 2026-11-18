import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import {
  FlatList,
  StatusBar,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import FeedItem, { Post } from '../../components/FeedItem';
import TopNavBar from '../../components/TopNavBar';
import AppToast from '../../components/AppToast';
import { FeedSkeleton } from '../../components/skeleton';
import { createStyles } from '../../styles/screens/main/feedScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useFeed } from '../../hooks/useFeed';
import { useNewSightings } from '../../context/NewSightingsContext';
import { useFeedPreferences } from '../../context/FeedPreferencesContext';
import { useT } from '../../i18n';
import { FeedCategoryBar } from '../../components/feed/FeedCategoryBar';
import { FeedEmptyState } from '../../components/feed/FeedEmptyState';

export default function FeedScreen() {
  const navigation = useNavigation<any>();
  const { screen: styles, isDark, colors } = useDynamicStyles(createStyles);
  const { t } = useT();

  const {
    posts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    loadError,
    loadMoreError,
    toast,
    setToast,
    loadMore,
    retryLoadMore,
    retryInitialLoad,
    handlePostDeleted,
    handleLikeToggled,
    handleCommentAdded,
    onRefresh,
  } = useFeed();

  const {
    preferences,
    refreshFollows,
    setFilterMode,
    setProximityRadius,
    setOnlyVerified,
  } = useFeedPreferences();

  const { hasNewPosts, newPostIds, clearNewPosts } = useNewSightings();
  const [showNewBanner, setShowNewBanner] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Al enfocar, refrescar relaciones de follow respetando su caché por TTL
  useFocusEffect(
    useCallback(() => {
      refreshFollows(false);
      if (hasNewPosts) {
        setShowNewBanner(true);
      }
    }, [hasNewPosts, refreshFollows])
  );

  // Mostrar banner instantáneamente cuando llegue un nuevo avistamiento
  useEffect(() => {
    if (hasNewPosts) {
      setShowNewBanner(true);
    }
  }, [hasNewPosts]);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <FeedItem
        post={item}
        onPostDeleted={handlePostDeleted}
        onLikeToggled={handleLikeToggled}
        onCommentAdded={handleCommentAdded}
        isNew={newPostIds.has(item.id)}
      />
    ),
    [handlePostDeleted, handleLikeToggled, handleCommentAdded, newPostIds]
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const handleBannerPress = () => {
    setShowNewBanner(false);
    clearNewPosts();
    onRefresh();
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const emptyFilterMessage = useMemo(() => {
    switch (preferences.filterMode) {
      case 'following':
        return t('feed.emptyFilterFollowing');
      case 'followers':
        return t('feed.emptyFilterFollowers');
      case 'mutuals':
        return t('feed.emptyFilterMutuals');
      case 'proximity':
        return t('feed.emptyFilterProximity', {
          radius: preferences.proximityRadiusKm,
        });
      default:
        return preferences.onlyVerified
          ? t('feed.emptyFilterVerified')
          : t('feed.emptyCommunity');
    }
  }, [preferences.filterMode, preferences.proximityRadiusKm, preferences.onlyVerified, t]);

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    if (loadMoreError) {
      return (
        <View style={{ paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center', gap: 8 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center' }}>
            {loadMoreError}
          </Text>
          <TouchableOpacity
            onPress={retryLoadMore}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: colors.primary,
            }}
          >
            <Ionicons name="refresh" size={14} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!hasMore && posts.length > 0) {
      return <View style={{ height: 12 }} />;
    }

    return null;
  }, [isLoadingMore, loadMoreError, hasMore, posts.length, colors, retryLoadMore]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <TopNavBar />
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Selector Rápido de Categorías y Filtros con Input Manual de Distancia */}
      <FeedCategoryBar
        preferences={preferences}
        onSelectMode={(mode) => setFilterMode(mode)}
        onRadiusChange={(radius) => setProximityRadius(radius)}
        onToggleVerified={() => setOnlyVerified(!preferences.onlyVerified)}
        onOpenPreferences={() => navigation.navigate('FeedPreferences')}
        colors={colors}
      />

      {isLoading ? (
        <FeedSkeleton />
      ) : loadError && posts.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
            gap: 12,
          }}
        >
          <Ionicons name="alert-circle-outline" size={44} color={colors.primary} />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 15,
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            {loadError}
          </Text>
          <TouchableOpacity
            onPress={retryInitialLoad}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: colors.primary,
              marginTop: 4,
            }}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      ) : posts.length === 0 ? (
        <FeedEmptyState
          filterMode={preferences.filterMode}
          onlyVerified={preferences.onlyVerified}
          message={emptyFilterMessage}
          onResetFilters={() => {
            setFilterMode('all');
            setOnlyVerified(false);
          }}
          onOpenPreferences={() => navigation.navigate('FeedPreferences')}
          onNewSighting={() => navigation.navigate('RecordSighting')}
          colors={colors}
        />
      ) : (
        <View style={styles.container}>
          <FlatList
            ref={listRef}
            data={posts}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={5}
            removeClippedSubviews={true}
            onEndReached={() => loadMore(false)}
            onEndReachedThreshold={0.4}
            ListFooterComponent={renderFooter}
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
              style={styles.newPostsBanner}
              activeOpacity={0.85}
              onPress={handleBannerPress}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.newPostsBannerText}>
                {t('feed.newSightingBanner')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
