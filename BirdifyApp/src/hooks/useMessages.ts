import React, { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConversationRepository } from '../repositories/conversation.repository';
import { UserBlockRepository } from '../repositories/user_block.repository';
import { useAuth } from '../context/AuthContext';
import { useUnreadMessages } from '../context/UnreadMessagesContext';
import { RootStackParamList, ChatThread } from '../navigation/AppNavigator';
import { Dimensions } from 'react-native';
import { handleError } from '../utils/errorHandler';

type MessagesNavProp = NativeStackNavigationProp<RootStackParamList, 'Messages'>;

export function useMessages() {
  const navigation = useNavigation<MessagesNavProp>();
  const { user } = useAuth();
  const { conversations, refreshConversations, conversationsLoading } = useUnreadMessages();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ChatThread | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const load = useCallback(async (_silent = false) => {
    await refreshConversations();
  }, [refreshConversations]);

  // Refrescar silenciosamente al entrar a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        refreshConversations();
      }
    }, [user, refreshConversations])
  );

  const handleDeleteConversation = async (conversationId: string) => {
    setConversationToDelete(conversationId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;
    const thread = conversations.find((t) => t.id === conversationToDelete);
    if (!thread) return;
    if (thread.userRole !== 'admin') {
      setDeleteModalVisible(false);
      setConversationToDelete(null);
      showToast('Solo el administrador puede eliminar esta conversación.', 'error');
      return;
    }
    try {
      await ConversationRepository.deleteConversation(conversationToDelete);
      setDeleteModalVisible(false);
      setConversationToDelete(null);
      refreshConversations();
    } catch (error) {
      handleError(error, setToast, 'Error deleting conversation');
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
      refreshConversations();
    } catch (e) {
      handleError(e, setToast, 'No se pudo salir del grupo.');
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
      refreshConversations();
    } catch (e) {
      handleError(e, setToast, 'No se pudo bloquear al usuario.');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
  };

  return {
    // State
    loading: conversationsLoading,
    threads: conversations,
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
