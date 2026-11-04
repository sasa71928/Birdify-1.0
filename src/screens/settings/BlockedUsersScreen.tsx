import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../i18n';
import { UserBlockRepository } from '../../repositories/user_block.repository';
import { handleError, showSuccess } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';
import { SettingsScaffold } from '../../components/settings';
import { PressableScale } from '../../components/animated';
import { Radius, Typography, Shadows } from '../../theme';

interface BlockedUserItem {
  id: string;
  username: string;
  fullname?: string | null;
  profile_pic_url?: string | null;
}

export default function BlockedUsersScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useDynamicStyles();
  const { user } = useAuth();
  const { t } = useT();

  const [blockedUsers, setBlockedUsers] = useState<BlockedUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingUserId, setUnblockingUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const loadBlockedUsers = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await UserBlockRepository.getBlockedUsers(user.id);
      setBlockedUsers(data || []);
    } catch (error) {
      handleError(error, setToast, 'Error loading blocked users');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadBlockedUsers();
    }, [loadBlockedUsers])
  );

  const handleUnblock = async (blockedId: string, username: string) => {
    if (!user || unblockingUserId) return;

    try {
      setUnblockingUserId(blockedId);
      await UserBlockRepository.unblock(user.id, blockedId);
      setBlockedUsers((prev) => prev.filter((item) => item.id !== blockedId));
      showSuccess(t('settings.unblockedSuccess'), setToast);
    } catch (error) {
      handleError(error, setToast, 'Failed to unblock user');
    } finally {
      setUnblockingUserId(null);
    }
  };

  return (
    <SettingsScaffold
      title={t('settings.blockedTitle')}
      onBack={() => navigation.goBack()}
    >
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : blockedUsers.length === 0 ? (
        <View style={styles.emptyBox}>
          <View
            style={[
              styles.emptyIconBox,
              { backgroundColor: colors.primary + '14' },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={36}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('settings.noBlockedUsers')}
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {blockedUsers.map((item) => (
            <Animated.View
              key={item.id}
              exiting={FadeOutLeft.duration(220)}
              layout={LinearTransition.springify().damping(18)}
              style={[
                styles.userCard,
                {
                  backgroundColor: colors.canvasPure,
                  borderColor: isDark ? colors.border + '30' : colors.border + '20',
                },
              ]}
            >
              <Image
                source={{
                  uri: item.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
                }}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text
                  numberOfLines={1}
                  style={[styles.fullName, { color: colors.textPrimary }]}
                >
                  {item.fullname || item.username}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.username, { color: colors.textSecondary }]}
                >
                  @{item.username}
                </Text>
              </View>

              <PressableScale
                activeScale={0.94}
                haptic="medium"
                disabled={unblockingUserId === item.id}
                onPress={() => handleUnblock(item.id, item.username)}
                style={[
                  styles.unblockBtn,
                  { backgroundColor: colors.primary + '18' },
                ]}
              >
                {unblockingUserId === item.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={[styles.unblockBtnText, { color: colors.primary }]}>
                    {t('settings.unblock')}
                  </Text>
                )}
              </PressableScale>
            </Animated.View>
          ))}
        </View>
      )}
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  loadingBox: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyBody,
    textAlign: 'center',
  },
  listContainer: {
    paddingTop: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: 10,
    ...Shadows.card,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  fullName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  username: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyBody,
    marginTop: 2,
  },
  unblockBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unblockBtnText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
});
