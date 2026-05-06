import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

import styles from '../styles/BottomNavBar.styles';

export default function BottomNavBar({ state }: any) {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  
  // If used as a custom tab bar, state is provided. Otherwise, fallback to standard route.name.
  const currentRoute = state ? state.routes[state.index].name : route.name;

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableOpacity 
          style={[styles.navItem, currentRoute === 'Feed' && styles.activeItem]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Feed' })}
        >
          <Ionicons name="home-outline" size={currentRoute === 'Feed' ? 26 : 24} color={currentRoute === 'Feed' ? Colors.primary : Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, currentRoute === 'Explore' && styles.activeItem]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
        >
          <Ionicons name="compass-outline" size={currentRoute === 'Explore' ? 26 : 24} color={currentRoute === 'Explore' ? Colors.primary : Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('RecordSighting')}
        >
          <View style={styles.plusContainer}>
            <Ionicons name="add" size={32} color={Colors.white} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, currentRoute === 'Dictionary' && styles.activeItem]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Dictionary' })}
        >
          <Ionicons name="book-outline" size={currentRoute === 'Dictionary' ? 26 : 24} color={currentRoute === 'Dictionary' ? Colors.primary : Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, currentRoute === 'Messages' && styles.activeItem]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Messages' })}
        >
          <Ionicons name="chatbubble-outline" size={currentRoute === 'Messages' ? 26 : 24} color={currentRoute === 'Messages' ? Colors.primary : Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
