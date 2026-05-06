import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

import styles from '../styles/TopNavBar.styles';

export default function TopNavBar() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
                <MaterialCommunityIcons name="bird" size={16} color="white" />
            </View>
          <Text style={styles.logoText}>Birdify</Text>
        </View>
      </View>
      <View style={styles.right}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' }} 
            style={styles.profileImage} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
