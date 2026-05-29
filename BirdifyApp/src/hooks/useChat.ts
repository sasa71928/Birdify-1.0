import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated, PanResponder, FlatList } from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { MessageRepository } from '../repositories/message.repository';
import { UserBlockRepository } from '../repositories/user_block.repository';
import { MessageReadRepository } from '../repositories/message_read.repository';
import { ConversationRepository } from '../repositories/conversation.repository';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as ImagePicker from 'expo-image-picker';
import { handleError } from '../utils/errorHandler';

type ChatNavProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

export interface Message {
  id: string;
  text: string;
  time: string;
  isMine: boolean;
  image?: string | null;
  replyTo?: {
    content: string | null;
    image: string | null;
    sender: string;
  };
  sender_id: string;
}

export function useChat() {
  const navigation = useNavigation<ChatNavProp>();
  const route = useRoute<ChatRouteProp>();
  const { conversationId } = route.params;
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);
  const [loading, setLoading] = useState(true);
  const [headerTitle, setHeaderTitle] = useState('Chat');
  const [isGroup, setIsGroup] = useState(false);
  const [headerAvatar, setHeaderAvatar] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [conversationExists, setConversationExists] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const highlightBorderWidth = useRef(new Animated.Value(0)).current;
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const loadConversation = async () => {
    try {
      const conversation = await ConversationRepository.getById(conversationId);
      if (!conversation) {
        setConversationExists(false);
        setLoading(false);
        return;
      }
      setConversationExists(true);
      setIsGroup(conversation.is_group || false);
      setHeaderAvatar(conversation.avatar_url || null);

      const members = conversation.members || [];
      const otherMember = members.find((m: any) => m.user_id !== user?.id);
      
      if (conversation.is_group) {
        setHeaderTitle(conversation.name || 'Grupo');
      } else if (otherMember) {
        const userData = otherMember.users;
        setHeaderTitle(userData?.fullname || userData?.username || 'Usuario');
        setOtherUserId(otherMember.user_id);
      }
    } catch (error) {
      handleError(error, setToast, 'Error loading conversation');
    }
  };

  const loadMessages = async () => {
    try {
      const data = await MessageRepository.list(conversationId);
      const mapped: Message[] = data.map((m: any) => ({
        id: m.id,
        text: m.content || '',
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMine: m.sender_id === user?.id,
        image: m.image_url,
        replyTo: m.reply_to ? {
          content: m.reply_to.content,
          image: m.reply_to.image_url,
          sender: m.reply_to.sender?.username || 'Usuario',
        } : undefined,
        sender_id: m.sender_id,
      }));
      setMessages(mapped);
    } catch (error) {
      handleError(error, setToast, 'Error loading messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversation();
    loadMessages();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          const mapped: Message = {
            id: newMessage.id,
            text: newMessage.content || '',
            time: new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMine: newMessage.sender_id === user?.id,
            image: newMessage.image_url,
            sender_id: newMessage.sender_id,
          };
          setMessages((prev) => [...prev, mapped]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [conversationId])
  );

  useEffect(() => {
    if (messages.length > 0 && !loading) {
      const lastUnreadIndex = messages.map((m, i) => ({ m, i }))
        .filter(({ m }) => !m.isMine)
        .reverse()
        .find(({ m }) => m.isMine)?.i ?? messages.length - 1;

      const timeout = setTimeout(() => {
        if (listRef.current) {
          if (lastUnreadIndex >= 0 && lastUnreadIndex < messages.length - 1) {
            listRef.current.scrollToIndex({ index: lastUnreadIndex, viewPosition: 0.5, animated: true });
          } else {
            listRef.current.scrollToEnd({ animated: true });
          }
        }
      }, 100);

      const markAsReadTimeout = setTimeout(async () => {
        if (user) {
          const unreadMessages = messages.filter(m => !m.isMine);
          if (unreadMessages.length > 0) {
            const messageIds = unreadMessages.map(m => m.id);
            await MessageReadRepository.markMultipleAsRead(messageIds, user.id);
          }
        }
      }, 500);

      return () => {
        clearTimeout(timeout);
        clearTimeout(markAsReadTimeout);
      };
    }
  }, [messages, loading, user]);

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || !user) return;

    try {
      let conversationIdToUse = conversationId;
      
      if (!conversationExists && otherUserId) {
        conversationIdToUse = await ConversationRepository.createDirectConversation(user.id, otherUserId);
        setConversationExists(true);
      }

      await MessageRepository.send({
        conversationId: conversationIdToUse,
        senderId: user.id,
        content: input.trim() || null,
        imageUrl: selectedImage || undefined,
        replyToId: replyingTo?.id || undefined,
      });

      setInput('');
      setSelectedImage(null);
      setReplyingTo(null);

      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 50);
    } catch (error) {
      handleError(error, setToast, 'Error sending message');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      handleError('Permiso denegado', setToast, 'Se necesita permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const scrollToMessage = (messageId: string) => {
    const index = messages.findIndex(m => m.id === messageId);
    if (index !== -1 && listRef.current) {
      listRef.current.scrollToIndex({ index, viewPosition: 0.5, animated: true });
      setHighlightedMessageId(messageId);
      Animated.timing(highlightBorderWidth, {
        toValue: 4,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(highlightBorderWidth, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }).start(() => setHighlightedMessageId(null));
        }, 1000);
      });
    }
  };

  const handleBlockFromChat = async () => {
    if (!user || !otherUserId) return;
    try {
      await UserBlockRepository.block(user.id, otherUserId);
      showToast('Usuario bloqueado. Ya no recibirás sus mensajes.', 'success');
      setTimeout(() => navigation.goBack(), 700);
    } catch (e) {
      handleError(e, setToast, 'No se pudo bloquear al usuario.');
    } finally {
      setOptionsVisible(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!user || leaving) return;
    try {
      setLeaving(true);
      await ConversationRepository.leaveConversation(conversationId, user.id);
      showToast('Has salido del grupo.', 'success');
      setTimeout(() => navigation.goBack(), 700);
    } catch (e) {
      handleError(e, setToast, 'No se pudo salir del grupo.');
    } finally {
      setLeaving(false);
      setShowLeaveModal(false);
      setOptionsVisible(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
  };

  return {
    // State
    messages,
    input,
    replyingTo,
    selectedImage,
    listRef,
    loading,
    headerTitle,
    isGroup,
    headerAvatar,
    otherUserId,
    optionsVisible,
    showLeaveModal,
    leaving,
    conversationExists,
    highlightedMessageId,
    highlightBorderWidth,
    fullScreenImage,
    toast,
    
    // Setters
    setInput,
    setReplyingTo,
    setSelectedImage,
    setOptionsVisible,
    setShowLeaveModal,
    setFullScreenImage,
    setToast,
    
    // Actions
    sendMessage,
    pickImage,
    scrollToMessage,
    handleBlockFromChat,
    handleLeaveGroup,
    showToast,
  };
}
