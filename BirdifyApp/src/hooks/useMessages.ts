import React, { useState, useRef, useEffect } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { ConversationRepository } from '../repositories/conversation.repository';
import { UserBlockRepository } from '../repositories/user_block.repository';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, ChatThread } from '../navigation/AppNavigator';
import { Dimensions } from 'react-native';

type MessagesNavProp = NativeStackNavigationProp<RootStackParamList, 'Messages'>;

export function useMessages() {
  const navigation = useNavigation<MessagesNavProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const subscription = useRef<any>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ChatThread | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const load = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const items = await ConversationRepository.listForUser(user.id);

      const mapped: ChatThread[] = items.map((item) => {
        const c = item.conversation;
        const members = c.members || [];
        const other = members.find((m: any) => m.user_id !== user.id)?.users;

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

        // Calculate unread count (messages not sent by current user and not read)
        const unreadCount = item.unread || 0;

        return {
          id: c.id,
          name: title,
          avatar,
          lastMessage: displayMessage || '',
          time: '',
          unreadCount,
          isGroup: c.is_group,
        };
      });

      setThreads(mapped);
    } catch (error) {
      console.error('Error loading conversations:', error);
      showToast('Error al cargar conversaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const channelName = `messages-changes-${user.id}-${Date.now()}`;
    const channel = supabase
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reads',
        },
        () => {
          load();
        }
      )
      .subscribe();

    subscription.current = channel;

    return () => {
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
      load();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleLongPress = (item: ChatThread, event: any) => {
    setSelectedConversation(item);
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setOptionsVisible(true);
  };

  const handleOptionPress = (option: string) => {
    setOptionsVisible(false);
    if (option === 'delete' && selectedConversation) {
      handleDeleteConversation(selectedConversation.id);
    } else if (option === 'open' && selectedConversation) {
      navigation.navigate('Chat', { conversationId: selectedConversation.id });
    } else if (option === 'editGroup' && selectedConversation) {
      navigation.navigate('EditGroup', { conversationId: selectedConversation.id });
    } else if (option === 'blockUser' && selectedConversation) {
      handleBlockUser(selectedConversation.id);
    } else if (option === 'leaveGroup' && selectedConversation) {
      setShowLeaveModal(true);
    }
    setSelectedConversation(null);
  };

  const handleLeaveGroup = async () => {
    if (!user || !selectedConversation || leaving) return;
    try {
      setLeaving(true);
      await ConversationRepository.leaveConversation(selectedConversation.id, user.id);
      showToast('Has salido del grupo.', 'success');
      load();
    } catch (e) {
      console.error('Error leaving group:', e);
      showToast('No se pudo salir del grupo.', 'error');
    } finally {
      setLeaving(false);
      setShowLeaveModal(false);
    }
  };

  const handleBlockUser = async (conversationId: string) => {
    if (!user) return;
    try {
      const items = await ConversationRepository.listForUser(user.id);
      const conversation = items.find((item) => item.conversation.id === conversationId);
      if (!conversation) return;

      const members = conversation.conversation.members || [];
      const otherMember = members.find((m) => m.user_id !== user.id);
      if (!otherMember) return;

      await UserBlockRepository.block(user.id, otherMember.user_id);
      showToast('Usuario bloqueado.', 'success');
      load();
    } catch (e) {
      console.error('Error blocking user:', e);
      showToast('No se pudo bloquear al usuario.', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
  };

  return {
    // State
    loading,
    threads,
    deleteModalVisible,
    conversationToDelete,
    optionsVisible,
    selectedConversation,
    menuPosition,
    showLeaveModal,
    leaving,
    toast,
    navigation,
    
    // Setters
    setDeleteModalVisible,
    setConversationToDelete,
    setOptionsVisible,
    setSelectedConversation,
    setMenuPosition,
    setShowLeaveModal,
    setToast,
    
    // Actions
    load,
    confirmDelete,
    handleLongPress,
    handleOptionPress,
    handleLeaveGroup,
    handleBlockUser,
    showToast,
  };
}
