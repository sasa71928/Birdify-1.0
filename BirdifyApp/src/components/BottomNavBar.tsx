import React, { useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, OfflineContext } from '../navigation/AppNavigator';
import { useNewSightings } from '../context/NewSightingsContext';
import { useUnreadMessages } from '../context/UnreadMessagesContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

import { createStyles } from '../styles/components/BottomNavBar.styles';
import { useDynamicStyles } from '../hooks/useDynamicStyles';

export default function BottomNavBar({ state, hideNav }: { state?: any; hideNav?: boolean }) {
  const navigation = useNavigation<NavigationProp>();
  const { screen: styles, colors } = useDynamicStyles(createStyles);
  const route = useRoute();
  const { hasNewPosts } = useNewSightings();
  const { unreadCount, refreshUnread } = useUnreadMessages();
  const isOffline = useContext(OfflineContext);

  const currentRoute = state ? state.routes[state.index].name : route.name;

  useEffect(() => {
    refreshUnread();
  }, [state?.index, refreshUnread]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshUnread();
    });
    return unsubscribe;
  }, [navigation, refreshUnread]);

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>

        {/* Home — oculto en offline o hideNav */}
        {!isOffline && (
          <TouchableOpacity
            style={[styles.navItem, currentRoute === 'Feed' && styles.activeItem]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Feed' })}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="home-outline"
                size={currentRoute === 'Feed' ? 26 : 24}
                color={currentRoute === 'Feed' ? colors.primary : colors.textSecondary}
              />
              {hasNewPosts && <View style={styles.newBadge} />}
            </View>
          </TouchableOpacity>
        )}

        {/* Explore — oculto en offline o hideNav */}
        {!isOffline && (
          <TouchableOpacity
            style={[styles.navItem, currentRoute === 'Explore' && styles.activeItem]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
          >
            <Ionicons
              name="compass-outline"
              size={currentRoute === 'Explore' ? 26 : 24}
              color={currentRoute === 'Explore' ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {/* Botón + siempre visible */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('RecordSighting' as any)}
        >
          <View style={styles.plusContainer}>
            <Ionicons name="add" size={32} color={colors.white} />
          </View>
        </TouchableOpacity>

        {/* Dictionary — oculto en offline o hideNav */}
        {!isOffline && (
          <TouchableOpacity
            style={[styles.navItem, currentRoute === 'Dictionary' && styles.activeItem]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Dictionary' })}
          >
            <Ionicons
              name="book-outline"
              size={currentRoute === 'Dictionary' ? 26 : 24}
              color={currentRoute === 'Dictionary' ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {/* Messages — oculto en offline o hideNav */}
        {!isOffline && (
          <TouchableOpacity
            style={[styles.navItem, currentRoute === 'Messages' && styles.activeItem]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Messages' })}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="chatbubble-outline"
                size={currentRoute === 'Messages' ? 26 : 24}
                color={currentRoute === 'Messages' ? colors.primary : colors.textSecondary}
              />
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
}