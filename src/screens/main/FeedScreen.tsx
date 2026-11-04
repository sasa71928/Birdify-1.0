import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import {
  FlatList,
  StatusBar,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
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
    toast,
    setToast,
    handlePostDeleted,
    handleLikeToggled,
    handleCommentAdded,
    onRefresh,
  } = useFeed();

  const {
    preferences,
    filterPosts,
    refreshFollows,
    setFilterMode,
    setProximityRadius,
    setOnlyVerified,
  } = useFeedPreferences();

  const { hasNewPosts, newPostIds, clearNewPosts } = useNewSightings();
  const [showNewBanner, setShowNewBanner] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Filtrar publicaciones según preferencias del usuario
  const filteredPosts = useMemo(
    () => filterPosts(posts),
    [posts, filterPosts]
  );

  // Al enfocar, refrescar relaciones de follow para que los filtros estén siempre al día
  useFocusEffect(
    useCallback(() => {
      refreshFollows();
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
    if (posts.length === 0) {
      return t('feed.emptyCommunity');
    }
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
  }, [posts.length, preferences.filterMode, preferences.proximityRadiusKm, preferences.onlyVerified, t]);

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
      ) : filteredPosts.length === 0 ? (
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
            data={filteredPosts}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
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
