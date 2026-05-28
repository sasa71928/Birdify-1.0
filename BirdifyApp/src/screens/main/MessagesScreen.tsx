import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Typography, Spacing, Radius, Shadows } from '../../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../../components/TopNavBar';
import { RootStackParamList, ChatThread } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/main/messagesScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { ConversationRepository } from '../../repositories/conversation.repository';

type MessagesNavProp = NativeStackNavigationProp<RootStackParamList, 'Messages'>;

export default function MessagesScreen() {
  const navigation = useNavigation<MessagesNavProp>();
  const { shared, screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const items = await ConversationRepository.listForUser(user.id);

        const mapped: ChatThread[] = items.map((item) => {
          const c = item.conversation;
          const members = c.members || [];
          const other = members.find((m) => m.user_id !== user.id)?.user;

          const title = c.is_group ? (c.name || 'Group') : (other?.fullname || other?.username || 'Chat');
          const avatar =
            c.is_group
              ? (c.avatar_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=100')
              : (other?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp');

          const lastMessageText = item.lastMessage?.content || (item.lastMessage?.image_url ? '📷 Foto' : '');

          return {
            id: c.id,
            name: title,
            avatar,
            lastMessage: lastMessageText || '',
            time: '',
            isGroup: c.is_group,
          };
        });

        if (!mounted) return;
        setThreads(mapped);
      } catch (e) {
        console.error('Error loading conversations:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const renderItem = ({ item }: { item: ChatThread }) => (
    <TouchableOpacity
      style={[styles.threadItem, item.unreadCount ? styles.unreadThread : null]}
      activeOpacity={0.75}
      onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
    >
      <View style={styles.avatarContainer}>
        {item.isGroup ? (
            <View style={styles.groupAvatar}>
                <Ionicons name="people" size={24} color={colors.secondaryBlue} />
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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <TopNavBar />

      <View style={styles.container}>
        {/* ── Encabezado con título y botón crear grupo ── */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Messages</Text>
          <TouchableOpacity style={styles.createGroupBtn} activeOpacity={0.8} onPress={() => navigation.navigate('CreateGroup')}>
            <MaterialCommunityIcons name="account-multiple-plus-outline" size={20} color={colors.canvasPure} />
            <Text style={styles.createGroupText}>New Group</Text>
          </TouchableOpacity>
        </View>

        {/* ── Búsqueda ── */}
        <TouchableOpacity
          style={styles.searchContainer}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SearchMessages')}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search messages...</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={threads}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

