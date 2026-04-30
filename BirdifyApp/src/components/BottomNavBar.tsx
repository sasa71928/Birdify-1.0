import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BottomNavBar() {
  const navigation = useNavigation<NavigationProp>();
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableOpacity 
          style={[styles.navItem, styles.activeItem]}
          onPress={() => navigation.navigate('Feed')}
        >
          <Ionicons name="home-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Explore')}
        >
          <Ionicons name="compass-outline" size={24} color={Colors.textSecondary} />
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
          style={styles.navItem}
          onPress={() => navigation.navigate('Dictionary')}
        >
          <Ionicons name="book-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Messages')}
        >
          <Ionicons name="chatbubble-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingBottom: 20, // To account for bottom safe area
    paddingTop: 10,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  activeItem: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.lg,
  },
  navText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  addButton: {
    top: -10,
  },
  plusContainer: {
    backgroundColor: '#2D5A27', // Darker green as in image
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
