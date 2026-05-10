import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

import { useDynamicStyles } from '../hooks/useDynamicStyles';

export const createStyles = (colors: any) => StyleSheet.create({
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

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <TouchableOpacity 
          style={styles.logoContainer}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Feed' })}
        >
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.appLogo as any} 
          />
          <Text style={styles.logoText}>Birdify</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.right}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => {
            if (!isProfile) {
              navigation.navigate('Profile');
            } else {
              navigation.navigate('Settings');
            }
          }}
        >
          {isProfile ? (
            <Ionicons name="settings-outline" size={26} color={colors.primary} />
          ) : (
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' }} 
              style={styles.profileImage} 
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
