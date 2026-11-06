import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { useT } from '../../../i18n';
import { PressableScale } from '../../../components/animated';
import { Radius, Typography } from '../../../theme';
import { getFirstImageUrl } from '../utils/parsePhotoUrls';

interface LikesViewProps {
  likes: any[];
  isMe: boolean;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onItemPress?: (post: any) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 20;
const GAP = 8;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GAP * 2) / 3;

export const LikesView: React.FC<LikesViewProps> = ({
  likes,
  isMe,
  loading,
  error,
  onRetry,
  hasMore,
  loadingMore,
  onLoadMore,
  onItemPress,
}) => {
  const { colors, isDark } = useDynamicStyles();
  const { t } = useT();

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: 10 }]}>
          Cargando publicaciones con Me gusta...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <View
          style={[
            styles.emptyIconCircle,
            { backgroundColor: colors.errorRed + '14' },
          ]}
        >
          <Ionicons name="alert-circle-outline" size={36} color={colors.errorRed} />
        </View>
        <Text style={[styles.emptyText, { color: colors.textSecondary, marginBottom: 12 }]}>
          {error}
        </Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor: colors.primary,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: '#FFF',
                fontFamily: Typography.fontFamilyDisplay,
                fontWeight: '700',
              }}
            >
              Reintentar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (likes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View
          style={[
            styles.emptyIconCircle,
            { backgroundColor: colors.errorRed + '14' },
          ]}
        >
          <Ionicons name="heart-outline" size={36} color={colors.errorRed} />
        </View>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {isMe ? t('profile.noLikes') : t('profile.noLikesOther')}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.grid}>
        {likes.map((post) => {
          const imageUrl = getFirstImageUrl(post.photo_url);
          const reactionsCount =
            typeof post.likes_count === 'number'
              ? post.likes_count
              : Array.isArray(post.reactions) &&
                post.reactions.length === 1 &&
                typeof post.reactions[0]?.count === 'number'
              ? post.reactions[0].count
              : post.reactions?.length || 0;

          return (
            <PressableScale
              key={post.id}
              activeScale={0.93}
              haptic="light"
              onPress={() => onItemPress?.(post)}
              style={[
                styles.gridItem,
                {
                  backgroundColor: isDark ? '#2A2A2A' : '#E8ECE6',
                },
              ]}
            >
              <Image
                source={{ uri: imageUrl }}
                style={styles.gridImage}
                fadeDuration={0}
              />

              <View style={styles.heartBadge}>
                <Ionicons name="heart" size={11} color={colors.errorRed} />
                <Text style={styles.badgeCount}>{reactionsCount}</Text>
              </View>
            </PressableScale>
          );
        })}
      </View>
      {hasMore && (
        <TouchableOpacity
          style={{ paddingBottom: 32, alignItems: 'center', justifyContent: 'center' }}
          onPress={onLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text
              style={{
                fontSize: 13,
                color: colors.primary,
                fontFamily: Typography.fontFamilyDisplay,
                fontWeight: '700',
              }}
            >
              Cargar más likes
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_PADDING,
    gap: GAP,
    paddingBottom: 40,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  heartBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  badgeCount: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyBody,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 20,
  },
});

