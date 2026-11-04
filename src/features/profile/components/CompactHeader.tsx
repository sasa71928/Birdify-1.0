import React from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SharedValue } from 'react-native-reanimated';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { useT } from '../../../i18n';
import { PressableScale } from '../../../components/animated';
import { Typography } from '../../../theme';
import { haptics } from '../../../utils/haptics';

interface ProfileTopBarProps {
  profile: any;
  isMe: boolean;
  scrollY?: SharedValue<number>;
}

export const ProfileTopBar: React.FC<ProfileTopBarProps> = ({
  profile,
  isMe,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors } = useDynamicStyles();
  const { t } = useT();

  const fullname = profile?.fullname || profile?.username || t('common.user');
  const username = profile?.username || 'user';

  const handleShare = async () => {
    haptics.light();
    try {
      const shareUrl = `birdify://profile/${profile?.id || 'me'}`;
      await Share.share({
        message: `${t('profile.shareMessage', { username })}\n${shareUrl}`,
        url: shareUrl,
        title: `${fullname} (@${username}) - Birdify`,
      });
    } catch {
      // User cancelled
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 12),
          backgroundColor: colors.surface,
          borderBottomColor: colors.border + '20',
        },
      ]}
    >
      <View style={styles.content}>
        {/* Left: Botón regresar + @usuario */}
        <View style={styles.leftGroup}>
          <PressableScale
            activeScale={0.98}
            haptic="light"
            onPress={() => navigation.goBack()}
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </PressableScale>

          <Text
            numberOfLines={1}
            style={[styles.usernameTitle, { color: colors.textPrimary }]}
          >
            @{username}
          </Text>
        </View>

        {/* Right: Botón compartir + Botón configurar (si isMe) */}
        <View style={styles.rightGroup}>
          <PressableScale
            activeScale={0.98}
            haptic="light"
            onPress={handleShare}
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel={t('profile.shareProfile')}
          >
            <Ionicons
              name="share-social-outline"
              size={22}
              color={colors.textPrimary}
            />
          </PressableScale>

          {isMe && (
            <PressableScale
              activeScale={0.98}
              haptic="light"
              onPress={() => navigation.navigate('Settings')}
              style={[styles.actionBtn, { marginLeft: 4 }]}
              accessibilityRole="button"
              accessibilityLabel={t('nav.openSettings')}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={colors.textPrimary}
              />
            </PressableScale>
          )}
        </View>
      </View>
    </View>
  );
};

// Alias para compatibilidad de importaciones
export const CompactHeader = ProfileTopBar;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomWidth: 1,
    zIndex: 10,
  },
  content: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  usernameTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
    marginLeft: 6,
    flexShrink: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
