import React, { useContext } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, OfflineContext } from '../navigation/AppNavigator';
import { createStyles } from '../styles/components/BottomNavBar.styles';
import { useDynamicStyles } from '../hooks/useDynamicStyles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BottomNavBar({ state }: any) {
  const navigation  = useNavigation<NavigationProp>();
  const { screen: styles, colors } = useDynamicStyles(createStyles);
  const route       = useRoute();
  const isOffline   = useContext(OfflineContext);

  // If used as a custom tab bar, state is provided. Otherwise, fallback to standard route.name.
  const currentRoute = state ? state.routes[state.index].name : route.name;

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>

        {/* ── Botones visibles solo online ── */}
        {!isOffline && (
          <TouchableOpacity
            style={[styles.navItem, currentRoute === 'Feed' && styles.activeItem]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Feed' })}
          >
            <Ionicons
              name="home-outline"
              size={currentRoute === 'Feed' ? 26 : 24}
              color={currentRoute === 'Feed' ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        )}

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

        {/* ── Botón "+" siempre visible ── */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('RecordSighting')}
        >
          <View style={styles.plusContainer}>
            <Ionicons name="add" size={32} color={colors.white} />
          </View>
        </TouchableOpacity>

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

        {!isOffline && (
          <TouchableOpacity
            style={[styles.navItem, currentRoute === 'Messages' && styles.activeItem]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Messages' })}
          >
            <Ionicons
              name="chatbubble-outline"
              size={currentRoute === 'Messages' ? 26 : 24}
              color={currentRoute === 'Messages' ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
}