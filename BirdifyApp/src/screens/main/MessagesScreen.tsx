import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Typography, Spacing, Radius, Shadows } from '../../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopNavBar from '../../components/TopNavBar';
import { RootStackParamList, ChatThread } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/main/messagesScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { supabase } from '../../lib/supabase';
import AppToast from '../../components/AppToast';

type MessagesNavProp = NativeStackNavigationProp<RootStackParamList, 'Messages'>;

export default function MessagesScreen() {
  const navigation = useNavigation<MessagesNavProp>();
  const { shared, screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const subscription = useRef<any>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const load = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const items = await ConversationRepository.listForUser(user.id);

      const mapped: ChatThread[] = items.map((item) => {
        const c = item.conversation;
        const members = c.members || [];
        const other = members.find((m) => m.user_id !== user.id)?.users;

        const title = c.is_group ? (c.name || 'Group') : (other?.fullname || other?.username || 'Usuario');
        const avatar =
          c.is_group
            ? (c.avatar_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=100')
            : (other?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp');

        if (c.is_group) {
          console.log('Group conversation:', c.id, 'avatar_url:', c.avatar_url, 'final avatar:', avatar);
        }

        const lastMessageText = item.lastMessage?.content || (item.lastMessage?.image_url ? '📷 Foto' : '');
        
        // For group chats, prepend sender name to message preview
        const displayMessage = c.is_group && item.lastMessage?.sender 
          ? `${item.lastMessage.sender.fullname || item.lastMessage.sender.username}: ${lastMessageText}`
          : lastMessageText;

        return {
          id: c.id,
          name: title,
          avatar,
          lastMessage: displayMessage || '',
          time: '',
          isGroup: c.is_group,
        };
      });

      setThreads(mapped);
    } catch (e) {
      console.error('Error loading conversations:', e);
      showToast('Error al cargar conversaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    load();

    // Set up real-time subscription for messages
    if (user) {
      const channelName = `messages-changes-${user.id}-${Date.now()}`;
      subscription.current = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
          },
          () => {
            load();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversation_members',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            load();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
          },
          () => {
            load();
          }
        )
        .subscribe();
    }

    return () => {
      mounted = false;
      if (subscription.current) {
        supabase.removeChannel(subscription.current);
      }
    };
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        load();
      }
    }, [user])
  );

  const handleDeleteConversation = async (conversationId: string) => {
    setConversationToDelete(conversationId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;
    try {
      await ConversationRepository.deleteConversation(conversationToDelete);
      setDeleteModalVisible(false);
      setConversationToDelete(null);
      showToast('Conversación eliminada correctamente', 'success');
      load();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      showToast('No se pudo eliminar la conversación', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
  };

  const renderItem = ({ item }: { item: ChatThread }) => (
    <TouchableOpacity
      style={[styles.threadItem, item.unreadCount ? styles.unreadThread : null]}
      activeOpacity={0.75}
      onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
    >
      <View style={styles.avatarContainer}>
        {item.isGroup ? (
            item.avatar && item.avatar !== 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=100' ? (
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
                <View style={styles.groupAvatar}>
                    <Ionicons name="people" size={24} color={colors.secondaryBlue} />
                </View>
            )
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
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteConversation(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
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

      {/* Custom Delete Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="trash-outline" size={48} color="#FF6B6B" />
            </View>
            <Text style={styles.modalTitle}>Eliminar conversación</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setConversationToDelete(null);
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonTextDelete}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

