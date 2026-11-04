import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MapSighting } from '../../hooks/useExplore';
import { PressableScale } from '../animated/PressableScale';
import { Typography, Spacing, Radius, Shadows } from '../../theme';
import { useT } from '../../i18n';

interface SightingMapCardProps {
  sighting: MapSighting;
  distance: string | null;
  timeAgo: string;
  onClose: () => void;
  onViewDetails: () => void;
  onViewPost: () => void;
  onUserPress?: (userId: string) => void;
  colors: any;
}

export const SightingMapCard: React.FC<SightingMapCardProps> = React.memo(({
  sighting,
  distance,
  timeAgo,
  onClose,
  onViewDetails,
  onViewPost,
  onUserPress,
  colors,
}) => {
  const { t } = useT();

  const bird = sighting.bird;
  const commonName = bird?.common_name || bird?.name || 'Ave observada';
  const scientificName = bird?.scientific_name || bird?.scientificName || 'Aves sp.';
  const imageUrl =
    sighting.photo_url ||
    sighting.local_photo_path ||
    bird?.image_url ||
    bird?.photo_url ||
    bird?.image ||
    'https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80&w=400';

  const user = sighting.user;

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.canvasPure,
          borderColor: colors.border + '35',
        },
      ]}
    >
      {/* HEADER: Observer & Distance */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.userRow}
          activeOpacity={0.7}
          disabled={!user?.id}
          onPress={() => user?.id && onUserPress?.(user.id)}
        >
          {user?.profile_pic_url ? (
            <ExpoImage
              source={{ uri: user.profile_pic_url }}
              style={styles.avatar}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '18' }]}>
              <Ionicons name="person" size={13} color={colors.primary} />
            </View>
          )}

          <Text style={[styles.usernameText, { color: colors.textPrimary }]} numberOfLines={1}>
            {user?.username ? `@${user.username}` : t('feed.anonymous')}
          </Text>

          {user?.is_verified && (
            <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
          )}

          <Text style={[styles.dotSeparator, { color: colors.textSecondary }]}>•</Text>
          <Text style={[styles.timeAgoText, { color: colors.textSecondary }]}>{timeAgo}</Text>
        </TouchableOpacity>

        <View style={styles.topRightActions}>
          {distance && (
            <View style={[styles.distanceBadge, { backgroundColor: colors.componentBase }]}>
              <Ionicons name="navigate" size={10} color={colors.primary} />
              <Text style={[styles.distanceText, { color: colors.primary }]}>
                {distance} km
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.componentBase }]}
            activeOpacity={0.7}
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT: Image & Bird Details */}
      <View style={styles.contentRow}>
        <View style={[styles.imageWrapper, { backgroundColor: colors.surfaceDim }]}>
          <ExpoImage
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
          />
        </View>

        <View style={styles.infoWrapper}>
          <Text style={[styles.birdName, { color: colors.textPrimary }]} numberOfLines={1}>
            {commonName}
          </Text>

          <Text style={[styles.scientificName, { color: colors.textSecondary }]} numberOfLines={1}>
            {scientificName}
          </Text>

          {sighting.description ? (
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]} numberOfLines={1}>
              "{sighting.description}"
            </Text>
          ) : (
            <View style={styles.statusPill}>
              <MaterialCommunityIcons name="feather" size={11} color={colors.primary} />
              <Text style={[styles.statusPillText, { color: colors.primary }]}>
                Avistamiento verificado
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ACTION BUTTONS: Ver Publicación + Ficha de Especie */}
      <View style={styles.buttonsRow}>
        <PressableScale
          activeScale={0.96}
          haptic="light"
          style={[
            styles.actionBtn,
            styles.postBtn,
            {
              backgroundColor: colors.componentBase,
              borderColor: colors.border + '35',
            },
          ]}
          onPress={onViewPost}
        >
          <Ionicons name="images-outline" size={14} color={colors.textPrimary} />
          <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>
            {t('explore.viewPost')}
          </Text>
        </PressableScale>

        <PressableScale
          activeScale={0.96}
          haptic="light"
          style={[styles.actionBtn, styles.detailsBtn, { backgroundColor: colors.primary }]}
          onPress={onViewDetails}
        >
          <Ionicons name="book-outline" size={14} color="#FFFFFF" />
          <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>
            {t('explore.speciesDetails')}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    bottom: 85,
    left: Spacing.md,
    right: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    ...Shadows.modal,
    gap: 10,
    zIndex: 9999,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  avatarPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.fontFamilyBody,
  },
  dotSeparator: {
    fontSize: 10,
  },
  timeAgoText: {
    fontSize: 11,
    fontFamily: Typography.fontFamilyBody,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  distanceText: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: Typography.fontFamilyDisplay,
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageWrapper: {
    width: 66,
    height: 66,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoWrapper: {
    flex: 1,
    gap: 2,
  },
  birdName: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Typography.fontFamilyDisplay,
  },
  scientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    fontFamily: Typography.fontFamilyBody,
  },
  descriptionText: {
    fontSize: 11.5,
    fontFamily: Typography.fontFamilyBody,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Typography.fontFamilyBody,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  actionBtn: {
    height: 40,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  postBtn: {
    flex: 1,
    borderWidth: 1,
  },
  detailsBtn: {
    flex: 1.1,
  },
  actionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: Typography.fontFamilyDisplay,
  },
});
