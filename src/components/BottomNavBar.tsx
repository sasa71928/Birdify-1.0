import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { OfflineContext } from '../context/OfflineContext';
import { useNewSightings } from '../context/NewSightingsContext';
import { useUnreadMessages } from '../context/UnreadMessagesContext';
import { createStyles } from '../styles/components/BottomNavBar.styles';
import { useDynamicStyles } from '../hooks/useDynamicStyles';
import { useT } from '../i18n';
import { PressableScale } from './animated/PressableScale';
import { haptics } from '../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BottomNavBar({
  state,
  hideNav,
}: {
  state?: any;
  hideNav?: boolean;
}) {
  const navigation = useNavigation<NavigationProp>();
  const { screen: styles, colors } = useDynamicStyles(createStyles);
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { hasNewPosts } = useNewSightings();
  const { unreadCount } = useUnreadMessages();
  const isOffline = useContext(OfflineContext);
  const { t } = useT();

  if (hideNav) return null;

  const currentRoute = state ? state.routes[state.index].name : route.name;
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 2 : 10;

  const handleTabPress = (tabName: 'Feed' | 'Explore' | 'Dictionary' | 'Messages') => {
    haptics.selection();
    navigation.navigate('MainTabs', { screen: tabName });
  };

  const handleRecordPress = () => {
    haptics.medium();
    navigation.navigate('RecordSighting' as any);
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.innerContainer}>
        {/* 1. Inicio / Feed */}
        <PressableScale
          activeScale={0.93}
          style={styles.navItem}
          onPress={() => handleTabPress('Feed')}
          accessibilityRole="button"
          accessibilityLabel={t('nav.feed')}
          accessibilityState={{ selected: currentRoute === 'Feed' }}
        >
          <View style={styles.navItemInner}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={currentRoute === 'Feed' ? 'home' : 'home-outline'}
                size={24}
                color={
                  currentRoute === 'Feed' ? colors.primary : colors.textSecondary
                }
              />
              {hasNewPosts && <View style={styles.newBadge} />}
            </View>
            <Text
              style={
                currentRoute === 'Feed' ? styles.activeText : styles.navText
              }
            >
              {t('nav.feed')}
            </Text>
            {currentRoute === 'Feed' && <View style={styles.activeIndicatorDot} />}
          </View>
        </PressableScale>

        {/* 2. Explorar / Mapa (solo online) */}
        {!isOffline && (
          <PressableScale
            activeScale={0.93}
            style={styles.navItem}
            onPress={() => handleTabPress('Explore')}
            accessibilityRole="button"
            accessibilityLabel={t('nav.explore')}
            accessibilityState={{ selected: currentRoute === 'Explore' }}
          >
            <View style={styles.navItemInner}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={currentRoute === 'Explore' ? 'compass' : 'compass-outline'}
                  size={24}
                  color={
                    currentRoute === 'Explore'
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
              </View>
              <Text
                style={
                  currentRoute === 'Explore'
                    ? styles.activeText
                    : styles.navText
                }
              >
                {t('nav.explore')}
              </Text>
              {currentRoute === 'Explore' && (
                <View style={styles.activeIndicatorDot} />
              )}
            </View>
          </PressableScale>
        )}

        {/* 3. Botón Central Flotante: Registrar Avistamiento (+) */}
        <PressableScale
          activeScale={0.92}
          style={styles.addButtonWrap}
          onPress={handleRecordPress}
          accessibilityRole="button"
          accessibilityLabel={t('nav.record')}
        >
          <View style={styles.plusContainer}>
            <Ionicons name="camera" size={26} color="#FFFFFF" />
          </View>
          <Text style={styles.addLabel}>{t('nav.record')}</Text>
        </PressableScale>

        {/* 4. Diccionario / Guía de Aves */}
        <PressableScale
          activeScale={0.93}
          style={styles.navItem}
          onPress={() => handleTabPress('Dictionary')}
          accessibilityRole="button"
          accessibilityLabel={t('nav.dictionary')}
          accessibilityState={{ selected: currentRoute === 'Dictionary' }}
        >
          <View style={styles.navItemInner}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={currentRoute === 'Dictionary' ? 'book' : 'book-outline'}
                size={24}
                color={
                  currentRoute === 'Dictionary'
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </View>
            <Text
              style={
                currentRoute === 'Dictionary'
                  ? styles.activeText
                  : styles.navText
              }
            >
              {t('nav.dictionaryShort') || 'Guía'}
            </Text>
            {currentRoute === 'Dictionary' && (
              <View style={styles.activeIndicatorDot} />
            )}
          </View>
        </PressableScale>

        {/* 5. Mensajes (solo online) */}
        {!isOffline && (
          <PressableScale
            activeScale={0.93}
            style={styles.navItem}
            onPress={() => handleTabPress('Messages')}
            accessibilityRole="button"
            accessibilityLabel={
              unreadCount > 0
                ? t('nav.unreadMessagesCount', { count: unreadCount })
                : t('nav.messages')
            }
            accessibilityState={{ selected: currentRoute === 'Messages' }}
          >
            <View style={styles.navItemInner}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={
                    currentRoute === 'Messages'
                      ? 'chatbubble'
                      : 'chatbubble-outline'
                  }
                  size={24}
                  color={
                    currentRoute === 'Messages'
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                {unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={
                  currentRoute === 'Messages'
                    ? styles.activeText
                    : styles.navText
                }
              >
                {t('nav.messages')}
              </Text>
              {currentRoute === 'Messages' && (
                <View style={styles.activeIndicatorDot} />
              )}
            </View>
          </PressableScale>
        )}
      </View>
    </View>
  );
}
