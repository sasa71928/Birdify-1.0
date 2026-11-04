import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { useT } from '../../../i18n';
import { PressableScale, AnimatedCounter } from '../../../components/animated';
import { Typography } from '../../../theme';

interface ProfileStatsProps {
  followersCount: number;
  followingCount: number;
  speciesCount: number;
  sightingsCount: number;
  onFollowersPress: () => void;
  onFollowingPress: () => void;
  onSpeciesPress: () => void;
  onSightingsPress: () => void;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  followersCount,
  followingCount,
  speciesCount,
  sightingsCount,
  onFollowersPress,
  onFollowingPress,
  onSpeciesPress,
  onSightingsPress,
}) => {
  const { colors, isDark } = useDynamicStyles();
  const { t } = useT();

  return (
    <View
      style={[
        styles.statsSection,
        {
          borderTopColor: colors.border + (isDark ? '20' : '15'),
          borderBottomColor: colors.border + (isDark ? '20' : '15'),
        },
      ]}
    >
      <PressableScale
        activeScale={0.98}
        haptic="light"
        onPress={onFollowersPress}
        style={styles.statItem}
        accessibilityRole="button"
        accessibilityLabel={t('profile.followers')}
      >
        <AnimatedCounter
          value={followersCount}
          duration={180}
          style={[styles.statValue, { color: colors.textPrimary }]}
        />
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          {t('profile.followers')}
        </Text>
      </PressableScale>

      <View
        style={[
          styles.divider,
          { backgroundColor: colors.border + (isDark ? '25' : '18') },
        ]}
      />

      <PressableScale
        activeScale={0.98}
        haptic="light"
        onPress={onFollowingPress}
        style={styles.statItem}
        accessibilityRole="button"
        accessibilityLabel={t('profile.following')}
      >
        <AnimatedCounter
          value={followingCount}
          duration={180}
          style={[styles.statValue, { color: colors.textPrimary }]}
        />
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          {t('profile.following')}
        </Text>
      </PressableScale>

      <View
        style={[
          styles.divider,
          { backgroundColor: colors.border + (isDark ? '25' : '18') },
        ]}
      />

      <PressableScale
        activeScale={0.98}
        haptic="light"
        onPress={onSpeciesPress}
        style={styles.statItem}
        accessibilityRole="button"
        accessibilityLabel={t('profile.species')}
      >
        <AnimatedCounter
          value={speciesCount}
          duration={180}
          style={[styles.statValue, { color: colors.textPrimary }]}
        />
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          {t('profile.species')}
        </Text>
      </PressableScale>

      <View
        style={[
          styles.divider,
          { backgroundColor: colors.border + (isDark ? '25' : '18') },
        ]}
      />

      <PressableScale
        activeScale={0.98}
        haptic="light"
        onPress={onSightingsPress}
        style={styles.statItem}
        accessibilityRole="button"
        accessibilityLabel={t('profile.sightings')}
      >
        <AnimatedCounter
          value={sightingsCount}
          duration={180}
          style={[styles.statValue, { color: colors.textPrimary }]}
        />
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          {t('profile.sightings')}
        </Text>
      </PressableScale>
    </View>
  );
};

const styles = StyleSheet.create({
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 4,
    marginBottom: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Typography.fontFamilyBody,
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 26,
  },
});
