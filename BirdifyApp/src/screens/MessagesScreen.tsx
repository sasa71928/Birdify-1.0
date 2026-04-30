import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import shared from '../styles/shared.styles';

interface MessageThread {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isOnline?: boolean;
  isGroup?: boolean;
}

const MOCK_THREADS: MessageThread[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
    lastMessage: 'Did you see the Cardinal at the feeder today?',
    time: '2m',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Mike Thompson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
    lastMessage: 'Thanks for sharing the coordinates, headed there now.',
    time: '1h',
  },
  {
    id: '3',
    name: 'Local Birders Group',
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=100',
    lastMessage: 'Elena: Found a great spot for warblers near the old mill.',
    time: 'Yesterday',
    isGroup: true,
  },
  {
    id: '4',
    name: 'Anna K.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100',
    lastMessage: 'Yes, the lighting was perfect for those shots.',
    time: 'Tue',
  },
];

export default function MessagesScreen() {
  const renderItem = ({ item }: { item: MessageThread }) => (
    <TouchableOpacity style={[styles.threadItem, item.unreadCount ? styles.unreadThread : null]}>
      <View style={styles.avatarContainer}>
        {item.isGroup ? (
            <View style={styles.groupAvatar}>
                <Ionicons name="people" size={24} color="#6B90E3" />
            </View>
        ) : (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
        )}
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.threadInfo}>
        <View style={styles.threadHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.threadFooter}>
          <Text style={styles.lastMessage} numberOfLines={2}>{item.lastMessage}</Text>
          {item.unreadCount ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle="dark-content" />
      <TopNavBar />

      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor={Colors.placeholder}
          />
        </View>

        <FlatList
          data={MOCK_THREADS}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F3',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 50,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  listContent: {
    paddingBottom: 100,
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  unreadThread: {
    backgroundColor: '#F8FAF9',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.sm,
    marginHorizontal: -Spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  groupAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34A853',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  threadInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  time: {
    fontSize: 12,
    color: '#34A853',
    fontWeight: Typography.fontWeight.medium,
  },
  threadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: Spacing.sm,
    lineHeight: 18,
  },
  unreadBadge: {
    backgroundColor: '#1B4D3E',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
