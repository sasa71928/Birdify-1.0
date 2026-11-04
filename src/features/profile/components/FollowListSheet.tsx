import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { useT } from '../../../i18n';
import { AnimatedSheet, PressableScale } from '../../../components/animated';
import { Avatar } from '../../../components/ui/Avatar';
import { Radius, Typography } from '../../../theme';

interface FollowListSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  users: any[];
  loading: boolean;
  currentUserId?: string;
  togglingUserId: string | null;
  onFollowToggle: (user: any) => void;
}

export const FollowListSheet: React.FC<FollowListSheetProps> = ({
  visible,
  onClose,
  title,
  users,
  loading,
  currentUserId,
  togglingUserId,
  onFollowToggle,
}) => {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useDynamicStyles();
  const { t } = useT();

  return (
    <AnimatedSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('profile.noUsersInList')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          style={{ maxHeight: 360 }}
          renderItem={({ item }) => {
            const isSelf = currentUserId && item.id === currentUserId;
            return (
              <PressableScale
                activeScale={0.98}
                haptic="light"
                onPress={() => {
                  onClose();
                  navigation.navigate('Profile', { userId: item.id });
                }}
                style={styles.userRow}
              >
                <Avatar
                  uri={item.avatar}
                  name={item.name}
                  size={44}
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text
                    numberOfLines={1}
                    style={[styles.name, { color: colors.textPrimary }]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.username, { color: colors.textSecondary }]}
                  >
                    @{item.username}
                  </Text>
                </View>

                {!isSelf && (
                  <PressableScale
                    activeScale={0.98}
                    haptic="medium"
                    disabled={togglingUserId === item.id}
                    onPress={() => onFollowToggle(item)}
                    style={[
                      styles.followBtn,
                      {
                        backgroundColor: item.isFollowing
                          ? isDark
                            ? '#2E2E2E'
                            : '#E8ECE6'
                          : colors.primary,
                      },
                    ]}
                  >
                    {togglingUserId === item.id ? (
                      <ActivityIndicator
                        size="small"
                        color={item.isFollowing ? colors.textPrimary : '#FFF'}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.followBtnText,
                          {
                            color: item.isFollowing
                              ? colors.textPrimary
                              : '#FFF',
                          },
                        ]}
                      >
                        {item.isFollowing
                          ? t('profile.followingUser')
                          : t('profile.follow')}
                      </Text>
                    )}
                  </PressableScale>
                )}
              </PressableScale>
            );
          }}
        />
      )}
    </AnimatedSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    marginBottom: 8,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  loadingBox: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyBody,
  },
  listContent: {
    paddingVertical: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  username: {
    fontSize: 11,
    fontFamily: Typography.fontFamilyBody,
    marginTop: 2,
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    minWidth: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtnText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
});

