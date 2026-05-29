import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { MessageReadRepository } from '../repositories/message_read.repository';
import { ConversationRepository } from '../repositories/conversation.repository';
import { supabase } from '../lib/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

import { createStyles } from '../styles/components/BottomNavBar.styles';
import { useDynamicStyles } from '../hooks/useDynamicStyles';

export default function BottomNavBar({ state }: any) {
  const navigation = useNavigation<NavigationProp>();
  const { screen: styles, colors } = useDynamicStyles(createStyles);
  const route = useRoute();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // If used as a custom tab bar, state is provided. Otherwise, fallback to standard route.name.
  const currentRoute = state ? state.routes[state.index].name : route.name;

  useEffect(() => {
    if (!user) return;

    const loadUnreadCount = async () => {
      try {
        const conversations = await ConversationRepository.listForUser(user.id);
        const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread || 0), 0);
        setUnreadCount(totalUnread);
      } catch (e) {
        console.error('Error loading unread count:', e);
      }
    };

    loadUnreadCount();

    // Set up real-time subscription for message_reads
    const channelName = `unread-count-${user.id}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reads',
        },
        () => {
          loadUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableOpacity 
          style={[styles.navItem, currentRoute === 'Feed' && styles.activeItem]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Feed' })}
        >
          <Ionicons name="home-outline" size={currentRoute === 'Feed' ? 26 : 24} color={currentRoute === 'Feed' ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, currentRoute === 'Explore' && styles.activeItem]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
        >
          <Ionicons name="compass-outline" size={currentRoute === 'Explore' ? 26 : 24} color={currentRoute === 'Explore' ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('RecordSighting' as any)}
        >
          <View style={styles.plusContainer}>
            <Ionicons name="add" size={32} color={colors.white} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, currentRoute === 'Dictionary' && styles.activeItem]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Dictionary' })}
        >
          <Ionicons name="book-outline" size={currentRoute === 'Dictionary' ? 26 : 24} color={currentRoute === 'Dictionary' ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, currentRoute === 'Messages' && styles.activeItem]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Messages' })}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubble-outline" size={currentRoute === 'Messages' ? 26 : 24} color={currentRoute === 'Messages' ? colors.primary : colors.textSecondary} />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
