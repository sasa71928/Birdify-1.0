import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useDynamicStyles } from '../hooks/useDynamicStyles';
import { useAuth } from '../context/AuthContext';
import { useT } from '../i18n';
import { PressableScale } from './animated/PressableScale';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '20',
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    appLogo: {
      width: 32,
      height: 32,
      marginRight: 8,
      resizeMode: 'contain',
      borderRadius: 100,
    },
    logoText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconButton: {
      marginRight: 16,
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 18,
    },
    profileButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
  });

export default function TopNavBar() {
  const navigation = useNavigation<NavigationProp>();
  const { screen: styles, colors } = useDynamicStyles(createStyles);
  const route = useRoute();
  const isProfile = route.name === 'Profile';
  const { user } = useAuth();
  const { t } = useT();

  const routeParams = route.params as any;
  const isOtherUserProfile =
    isProfile &&
    routeParams?.userId &&
    routeParams?.userId !== 'me' &&
    routeParams?.userId !== user?.id;
  const isMyProfile = isProfile && !isOtherUserProfile;

  const avatarUrl =
    user?.user_metadata?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp';

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <PressableScale
          activeScale={0.98}
          haptic="light"
          style={styles.logoContainer}
          accessibilityRole="button"
          accessibilityLabel={t('nav.goHome')}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Feed' })}
        >
          <Image
            source={require('../../assets/icon.png')}
            style={styles.appLogo as any}
          />
          <Text style={styles.logoText}>Birdify</Text>
        </PressableScale>
      </View>
      <View style={styles.right}>
        <PressableScale
          activeScale={0.98}
          haptic="light"
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel={t('nav.searchPlaceholder')}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search-outline" size={24} color={colors.primary} />
        </PressableScale>
        <PressableScale
          activeScale={0.98}
          haptic="light"
          style={styles.profileButton}
          accessibilityRole="button"
          accessibilityLabel={
            isMyProfile ? t('nav.openSettings') : t('nav.openProfile')
          }
          onPress={() => {
            if (isMyProfile) {
              navigation.navigate('Settings');
            } else {
              navigation.navigate('Profile', { userId: 'me' });
            }
          }}
        >
          {isMyProfile ? (
            <Ionicons name="settings-outline" size={26} color={colors.primary} />
          ) : (
            <Image source={{ uri: avatarUrl }} style={styles.profileImage} />
          )}
        </PressableScale>
      </View>
    </View>
  );
}
