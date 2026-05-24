import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../../components/TopNavBar';
import { RootStackParamList, ChatThread } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/main/messagesScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { getThreads, getOrCreateDirectConversation } from '../../services/chat.service';

type MessagesNavProp = NativeStackNavigationProp<RootStackParamList, 'Messages'>;

export default function MessagesScreen() {
  const navigation = useNavigation<MessagesNavProp>();
  const { shared, screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { user } = useAuth();

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const raw = await getThreads(user.id);

      const mapped: ChatThread[] = raw
        .map((item: any) => {
          const conv = item.conversations;
          if (!conv) return null;
          const msgs: any[] = Array.isArray(conv.messages) ? conv.messages : [];
          const last = msgs.sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];

          return {
            id: conv.id,
            name: conv.name ?? 'Chat',
            avatar: conv.avatar_url ?? '',
            isGroup: conv.is_group ?? false,
            lastMessage: last?.content ?? '',
            time: last
              ? new Date(last.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '',
          } as ChatThread;
        })
        .filter(Boolean) as ChatThread[];

      setThreads(mapped);
    } catch (e: any) {
      console.error('Error cargando hilos:', e);
      setError('No se pudieron cargar los mensajes.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadThreads();
    }, [loadThreads])
  );

  // Los hilos cargados desde Supabase ya tienen IDs válidos — navegación directa
  const openChat = (thread: ChatThread) => {
    if (openingId) return;
    navigation.navigate('Chat', { thread });
  };

  const renderItem = ({ item }: { item: ChatThread }) => (
    <TouchableOpacity
      style={[styles.threadItem, item.unreadCount ? styles.unreadThread : null]}
      activeOpacity={0.75}
      disabled={openingId === item.id}
      onPress={() => openChat(item)}
    >
      <View style={styles.avatarContainer}>
        {item.isGroup ? (
          <View style={styles.groupAvatar}>
            <Ionicons name="people" size={24} color={colors.secondaryBlue} />
          </View>
        ) : item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.groupAvatar, { backgroundColor: colors.surface }]}>
            <Ionicons name="person" size={22} color={colors.textSecondary} />
          </View>
        )}
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.threadInfo}>
        <View style={styles.threadHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.threadFooter}>
          <Text style={styles.lastMessage} numberOfLines={2}>
            {item.lastMessage || 'Nuevo chat'}
          </Text>
          {item.unreadCount ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {openingId === item.id && (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
      <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
      <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 16 }}>
        No tienes conversaciones aún
      </Text>
      <Text style={{ color: colors.textSecondary, marginTop: 4, fontSize: 13 }}>
        Crea un grupo para empezar
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <TopNavBar />

      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Messages</Text>
          <TouchableOpacity
            style={styles.createGroupBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            <MaterialCommunityIcons
              name="account-multiple-plus-outline"
              size={20}
              color={colors.canvasPure}
            />
            <Text style={styles.createGroupText}>New Group</Text>
          </TouchableOpacity>
        </View>

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
        ) : error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#e53e3e' }}>{error}</Text>
            <TouchableOpacity onPress={loadThreads} style={{ marginTop: 12 }}>
              <Text style={{ color: colors.primary }}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={threads}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              threads.length === 0 && { flex: 1 },
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ── Helper para iniciar chat directo desde cualquier pantalla ─────────────────
// Importa y usa así desde ProfileScreen u otra:
//
//   import { openDirectChat } from '../main/MessagesScreen';
//   await openDirectChat(navigation, currentUser.id, otherUser.id, otherUser.username, otherUser.avatar_url ?? '');
//
export async function openDirectChat(
  navigation: any,
  currentUserId: string,
  otherUserId: string,
  otherUserName: string,
  otherAvatar: string
) {
  const convId = await getOrCreateDirectConversation(currentUserId, otherUserId);
  const thread: ChatThread = {
    id: convId,
    name: otherUserName,
    avatar: otherAvatar,
    isGroup: false,
    lastMessage: '',
    time: '',
  };
  navigation.navigate('Chat', { thread });
}