import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

import styles from '../styles/components/TopNavBar.styles';

export default function TopNavBar() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const isProfile = route.name === 'Profile';

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.appLogo as any} 
          />
          <Text style={styles.logoText}>Birdify</Text>
        </View>
      </View>
      <View style={styles.right}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search-outline" size={24} color={Colors.primary} />
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
            <Ionicons name="settings-outline" size={26} color={Colors.primary} />
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
