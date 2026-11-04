import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { useT } from '../../../i18n';
import { PressableScale } from '../../../components/animated';
import { Typography } from '../../../theme';

interface ProfileHeroProps {
  profile: any;
  isMe: boolean;
  isFollowingUser: boolean;
  togglingFollow: boolean;
  onFollowToggle: () => void;
  onMessagePress: () => void;
  onReportPress: () => void;
  scrollY?: SharedValue<number>;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  profile,
  isMe,
  isFollowingUser,
  togglingFollow,
  onFollowToggle,
  onMessagePress,
  onReportPress,
  scrollY,
}) => {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useDynamicStyles();
  const { t } = useT();

  const [hasAvatarError, setHasAvatarError] = useState(false);

  useEffect(() => {
    setHasAvatarError(false);
  }, [profile?.profile_pic_url]);

  const isVerified = profile?.is_verified === true;
  const username = profile?.username || 'user';
  const fullname = profile?.fullname || profile?.username || t('common.user');
  const DEFAULT_AVATAR = 'https://gravatar.com/avatar/?d=mp';
  const avatarUrl =
    !hasAvatarError && profile?.profile_pic_url && profile.profile_pic_url.trim() !== ''
      ? profile.profile_pic_url
      : DEFAULT_AVATAR;
  const bio = profile?.bio || t('profile.noBio');
  const roleName =
    profile?.user_level === 'admin'
      ? t('profile.adminRole')
      : isVerified
      ? t('profile.certifiedBadge')
      : t('profile.birdWatcherRole');

  // Subtle Parallax on cover (no exaggerated zoom/scale)
  const coverAnimStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const translateY = interpolate(
      scrollY.value,
      [-80, 0],
      [-10, 0],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Decorative gradient banner */}
      <View style={styles.bannerContainer}>
        <Animated.View
          style={[
            styles.bannerGradient,
            {
              backgroundColor: isDark ? '#143813' : '#1b5617',
            },
            coverAnimStyle,
          ]}
        >
          <View
            style={[
              styles.waveAccent,
              { backgroundColor: isDark ? '#236021' : '#307A25' },
            ]}
          />
        </Animated.View>
      </View>

      {/* Avatar with status ring */}
      <View style={styles.avatarRow}>
        <View
          style={[
            styles.avatarRing,
            {
              borderColor: isVerified ? '#E5A93C' : colors.surface,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatarImage}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            onError={() => setHasAvatarError(true)}
          />
          {isVerified && (
            <View
              style={[
                styles.verifiedBadge,
                { backgroundColor: colors.primary, borderColor: colors.surface },
              ]}
            >
              <Ionicons name="checkmark" size={13} color="#FFF" />
            </View>
          )}
        </View>
      </View>

      {/* Info: Name & Username */}
      <View style={styles.infoBox}>
        <View style={styles.nameRow}>
          <Text
            numberOfLines={1}
            style={[styles.fullName, { color: colors.textPrimary }]}
          >
            {fullname}
          </Text>
          {isVerified && (
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: colors.primary + '18',
                  borderColor: colors.primary + '35',
                },
              ]}
            >
              <MaterialCommunityIcons
                name="shield-check"
                size={13}
                color={colors.primary}
              />
              <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                {roleName}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.username, { color: colors.textSecondary }]}>
          @{username}
        </Text>

        <Text style={[styles.bio, { color: colors.textPrimary }]}>{bio}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        {isMe ? (
          <PressableScale
            activeScale={0.98}
            haptic="light"
            onPress={() => navigation.navigate('EditProfile')}
            style={[
              styles.editProfileBtn,
              { backgroundColor: colors.primary },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('profile.editProfile')}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#FFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.editProfileBtnText}>
              {t('profile.editProfile')}
            </Text>
          </PressableScale>
        ) : (
          <>
            {/* Follow / Unfollow Button */}
            <PressableScale
              activeScale={0.98}
              haptic="medium"
              disabled={togglingFollow}
              onPress={onFollowToggle}
              style={[
                styles.followBtn,
                isFollowingUser
                  ? {
                      backgroundColor: colors.surface,
                      borderColor: colors.border + '40',
                      borderWidth: 1,
                    }
                  : {
                      backgroundColor: colors.primary,
                    },
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                isFollowingUser ? t('profile.unfollow') : t('profile.follow')
              }
            >
              {togglingFollow ? (
                <ActivityIndicator
                  size="small"
                  color={isFollowingUser ? colors.textPrimary : '#FFF'}
                />
              ) : (
                <Text
                  style={[
                    styles.followBtnText,
                    {
                      color: isFollowingUser
                        ? colors.textPrimary
                        : '#FFF',
                    },
                  ]}
                >
                  {isFollowingUser
                    ? t('profile.followingUser')
                    : t('profile.follow')}
                </Text>
              )}
            </PressableScale>

            {/* Direct Message Button */}
            <PressableScale
              activeScale={0.98}
              haptic="light"
              onPress={onMessagePress}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: colors.canvasPure,
                  borderColor: colors.border + '30',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('profile.sendMessage')}
            >
              <Ionicons
                name="chatbubble-outline"
                size={19}
                color={colors.primary}
              />
            </PressableScale>

            {/* Report Button */}
            <PressableScale
              activeScale={0.98}
              haptic="light"
              onPress={onReportPress}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: colors.canvasPure,
                  borderColor: colors.border + '30',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('profile.reportUser')}
            >
              <Ionicons
                name="flag-outline"
                size={19}
                color={colors.errorRed}
              />
            </PressableScale>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingBottom: 8,
  },
  bannerContainer: {
    height: 96,
    width: '100%',
    overflow: 'hidden',
  },
  bannerGradient: {
    ...StyleSheet.absoluteFill,
    position: 'relative',
  },
  waveAccent: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -70,
    right: -30,
    opacity: 0.3,
  },
  avatarRow: {
    paddingHorizontal: 20,
    marginTop: -42,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    padding: 2.5,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  fullName: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '800',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  roleBadgeText: {
    fontSize: 11,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  username: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyBody,
    marginTop: 2,
    marginBottom: 8,
  },
  bio: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyBody,
    lineHeight: 20,
    marginBottom: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 6,
    gap: 10,
  },
  editProfileBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileBtnText: {
    color: '#FFF',
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  followBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followBtnText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
