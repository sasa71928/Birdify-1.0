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

interface SightingsGridProps {
  sightings: any[];
  isMe: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onItemPress?: (sighting: any) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 20;
const GAP = 8;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GAP * 2) / 3;

export const SightingsGrid: React.FC<SightingsGridProps> = ({
  sightings,
  isMe,
  hasMore,
  loadingMore,
  onLoadMore,
  onItemPress,
}) => {
  const { colors, isDark } = useDynamicStyles();
  const { t } = useT();

  if (sightings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View
          style={[
            styles.emptyIconCircle,
            { backgroundColor: colors.primary + '12' },
          ]}
        >
          <Ionicons name="camera-outline" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {isMe ? t('profile.noSightings') : t('profile.noSightingsOther')}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.grid}>
        {sightings.map((item) => {
          const hasLocation = !item.is_location_private && item.latitude && item.longitude;
          const imageUrl = getFirstImageUrl(item.photo_url);

          return (
            <PressableScale
              key={item.id}
              activeScale={0.93}
              haptic="light"
              onPress={() => onItemPress?.(item)}
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

              {hasLocation && (
                <View style={styles.locationBadge}>
                  <Ionicons name="location" size={11} color="#FFF" />
                </View>
              )}
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
              Cargar más avistamientos
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
  locationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
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

