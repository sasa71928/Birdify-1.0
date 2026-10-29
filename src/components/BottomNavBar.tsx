import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { OfflineContext } from '../context/OfflineContext';
import { useNewSightings } from '../context/NewSightingsContext';
import { useUnreadMessages } from '../context/UnreadMessagesContext';
import { createStyles } from '../styles/components/BottomNavBar.styles';
import { useDynamicStyles } from '../hooks/useDynamicStyles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BottomNavBar({ state, hideNav }: { state?: any; hideNav?: boolean }) {
  const navigation = useNavigation<NavigationProp>();
  const { screen: styles, colors } = useDynamicStyles(createStyles);
  const route = useRoute();
  const { hasNewPosts } = useNewSightings();
  const { unreadCount } = useUnreadMessages();
  const isOffline = useContext(OfflineContext);

  if (hideNav) return null;

  const currentRoute = state ? state.routes[state.index].name : route.name;

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Home — oculto en offline */}
        {!isOffline && (
          <TouchableOpacity
            style={[styles.navItem, currentRoute === 'Feed' && styles.activeItem]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Feed' })}
            accessibilityRole="button"
            accessibilityLabel="Inicio"
            accessibilityState={{ selected: currentRoute === 'Feed' }}
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

        {/* Explore — oculto en offline */}
        {!isOffline && (
          <TouchableOpacity
            style={[styles.navItem, currentRoute === 'Explore' && styles.activeItem]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
            accessibilityRole="button"
            accessibilityLabel="Explorar mapa"
            accessibilityState={{ selected: currentRoute === 'Explore' }}
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
          accessibilityRole="button"
          accessibilityLabel="Registrar nuevo avistamiento"
        >
          <View style={styles.plusContainer}>
            <Ionicons name="add" size={32} color={colors.white} />
          </View>
        </TouchableOpacity>

        {/* Dictionary — oculto en offline */}
        {!isOffline && (
          <TouchableOpacity
            style={[styles.navItem, currentRoute === 'Dictionary' && styles.activeItem]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Dictionary' })}
            accessibilityRole="button"
            accessibilityLabel="Guía de aves"
            accessibilityState={{ selected: currentRoute === 'Dictionary' }}
          >
            <Ionicons
              name="book-outline"
              size={currentRoute === 'Dictionary' ? 26 : 24}
              color={currentRoute === 'Dictionary' ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {/* Messages — oculto en offline */}
        {!isOffline && (
          <TouchableOpacity
            style={[styles.navItem, currentRoute === 'Messages' && styles.activeItem]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Messages' })}
            accessibilityRole="button"
            accessibilityLabel={
              unreadCount > 0 ? `Mensajes, ${unreadCount} sin leer` : 'Mensajes'
            }
            accessibilityState={{ selected: currentRoute === 'Messages' }}
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
