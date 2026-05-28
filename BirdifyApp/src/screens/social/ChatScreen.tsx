import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/social/chatScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { MessageRepository } from '../../repositories/message.repository';
import { UserBlockRepository } from '../../repositories/user_block.repository';
import AppToast from '../../components/AppToast';

type ChatNavProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  text: string;
  time: string;
  isMine: boolean;
  image?: string;
  senderName?: string;
  senderAvatar?: string;
  replyToId?: string;
  replyToText?: string;
  replyToUser?: string;
  replyToImage?: string;
  isRead?: boolean;
  createdAt?: string;
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const navigation = useNavigation<ChatNavProp>();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
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
  const [conversationExists, setConversationExists] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const highlightOpacity = useRef(new Animated.Value(0)).current;
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3600);
  };

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const messageDate = new Date(date);
    messageDate.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
      return 'Hoy';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) return;
      try {
        setLoading(true);

        const { data: conv, error: convError } = await supabase
          .from('conversations')
          .select(
            `
            id,
            name,
            avatar_url,
            is_group,
            members:conversation_members (
              user_id,
              users (id, username, fullname, profile_pic_url)
            )
          `
          )
          .eq('id', conversationId)
          .maybeSingle();

        if (convError) throw convError;

        if (!conv) {
          if (mounted) {
            setConversationExists(false);
            setLoading(false);
          }
          return;
        }

        const members = conv?.members || [];
        const otherMember = members.find((m: any) => m.user_id !== user.id);
        const other = Array.isArray(otherMember?.users) ? otherMember?.users[0] : otherMember?.users;

        if (mounted) {
          setConversationExists(true);
          setIsGroup(Boolean(conv?.is_group));
          setHeaderTitle(conv?.is_group ? (conv?.name || 'Group') : (other?.fullname || other?.username || 'Usuario'));
          setHeaderAvatar(conv?.is_group ? (conv?.avatar_url || null) : (other?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp'));
          setOtherUserId(conv?.is_group ? null : (other?.id || null));
        }

        // If direct chat and blocked either direction, disable loading messages
        if (!conv?.is_group && other?.id) {
          const [iBlocked, theyBlocked] = await Promise.all([
            UserBlockRepository.isBlocked(user.id, other.id),
            UserBlockRepository.isBlocked(other.id, user.id),
          ]);
          if (iBlocked || theyBlocked) {
            if (mounted) {
              setMessages([]);
              setLoading(false);
            }
            return;
          }
        }

        const rows = await MessageRepository.list(conversationId);
        const mapped: Message[] = rows.map((r) => ({
          id: r.id,
          text: r.content || '',
          time: r.created_at
            ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          isMine: r.sender_id === user.id,
          image: r.image_url || undefined,
          senderName: r.sender?.username,
          senderAvatar: r.sender?.profile_pic_url || undefined,
          replyToId: r.reply_to_id || undefined,
          replyToText: r.reply_to?.content || undefined,
          replyToUser: r.reply_to?.sender?.username || undefined,
          replyToImage: r.reply_to?.image_url || undefined,
          createdAt: r.created_at || undefined,
        }));

        if (mounted) setMessages(mapped);
      } catch (e) {
        console.error('Error loading chat:', e);
        showToast('No se pudo cargar el chat.', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
      navigation.navigate('MainTabs', { screen: 'Messages' });
    };
  }, [conversationId, user?.id, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      // Refresh conversation data when screen gains focus
      const refreshConversation = async () => {
        if (!user) return;
        try {
          const { data: conv, error: convError } = await supabase
            .from('conversations')
            .select(
              `
              id,
              name,
              avatar_url,
              is_group,
              members:conversation_members (
                user_id,
                users (id, username, fullname, profile_pic_url)
              )
            `
            )
            .eq('id', conversationId)
            .maybeSingle();

          if (convError) throw convError;

          if (conv) {
            setConversationExists(true);
            setIsGroup(Boolean(conv?.is_group));
            const otherUser = conv.members?.find((m: any) => m.user_id !== user.id)?.users;
            const userData = Array.isArray(otherUser) ? otherUser[0] : otherUser;
            setHeaderTitle(conv?.is_group ? (conv?.name || 'Group') : (userData?.fullname || userData?.username || 'Usuario'));
            setHeaderAvatar(conv?.is_group ? (conv?.avatar_url || null) : (userData?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp'));
            setOtherUserId(conv?.is_group ? null : (userData?.id || null));
          }
        } catch (e) {
          console.error('Error refreshing conversation:', e);
        }
      };

      refreshConversation();
    }, [conversationId, user?.id])
  );

  React.useEffect(() => {
    const hasUnread = messages.some(m => !m.isMine && !m.isRead);

    let timeoutId: ReturnType<typeof setTimeout>;

    if (hasUnread) {
      const firstUnreadIndex = messages.findIndex(m => !m.isMine && !m.isRead);
      if (firstUnreadIndex !== -1) {
        timeoutId = setTimeout(() => {
          listRef.current?.scrollToIndex({
            index: firstUnreadIndex,
            animated: true,
            viewPosition: 0
          });
        }, 500);
      }
    } else {
      listRef.current?.scrollToEnd({ animated: false });
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text && !selectedImage) return;
    if (!user) return;
    if (!conversationExists) {
      showToast('La conversación no existe.', 'error');
      return;
    }
    if (otherUserId) {
      const [iBlocked, theyBlocked] = await Promise.all([
        UserBlockRepository.isBlocked(user.id, otherUserId),
        UserBlockRepository.isBlocked(otherUserId, user.id),
      ]);
      if (iBlocked || theyBlocked) {
        showToast('No puedes enviar mensajes a este usuario.', 'error');
        return;
      }
    }
    const newMsg: Message = {
      id: Date.now().toString(),
      text: text || '',
      image: selectedImage || undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      replyToId: replyingTo?.id,
      replyToText: replyingTo?.text,
      replyToUser: replyingTo?.senderName || (replyingTo?.isMine ? 'Tú' : headerTitle),
      replyToImage: replyingTo?.image,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setSelectedImage(null);
    setReplyingTo(null);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await MessageRepository.send({
        conversationId,
        senderId: user.id,
        content: text || null,
        imageUrl: selectedImage || null,
        replyToId: replyingTo?.id || null,
      });
    } catch (e) {
      console.error('Error sending message:', e);
      showToast('No se pudo enviar el mensaje.', 'error');
    }
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Se necesita permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleBlockFromChat = async () => {
    if (!user || !otherUserId) return;
    try {
      await UserBlockRepository.block(user.id, otherUserId);
      showToast('Usuario bloqueado. Ya no recibirás sus mensajes.', 'success');
      setTimeout(() => navigation.goBack(), 700);
    } catch (e) {
      console.error('Error blocking from chat:', e);
      showToast('No se pudo bloquear al usuario.', 'error');
    } finally {
      setOptionsVisible(false);
    }
  };

  const SwipeableMessage = ({ children, onSwipe, isMine }: { children: React.ReactNode, onSwipe: () => void, isMine: boolean }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    
    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // Only capture horizontal swipes moving right
          return Math.abs(gestureState.dx) > 10 && gestureState.dx > 0 && !isMine;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx > 0 && gestureState.dx < 80) {
            translateX.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > 50) {
            onSwipe();
          }
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      })
    ).current;

    return (
      <Animated.View 
        style={{ transform: [{ translateX }] }} 
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    );
  };

  const scrollToMessage = (replyToId: string) => {
    const index = messages.findIndex((msg) => msg.id === replyToId);
    if (index !== -1) {
      setHighlightedMessageId(replyToId);
      highlightOpacity.setValue(1);
      
      // Fade out animation
      Animated.sequence([
        Animated.timing(highlightOpacity, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(highlightOpacity, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setHighlightedMessageId(null);
      });
      
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    // Show date label if this is the first message or if date changed from previous message
    const showDateLabel = index === 0 || (
      item.createdAt && 
      messages[index - 1]?.createdAt && 
      formatDateLabel(item.createdAt) !== formatDateLabel(messages[index - 1].createdAt!)
    );

    return (
      <>
        {showDateLabel && item.createdAt && (
          <View style={styles.dateLabelContainer}>
            <Text style={styles.dateLabel}>{formatDateLabel(item.createdAt)}</Text>
          </View>
        )}
        <View style={[styles.msgRow, item.isMine && styles.msgRowMine]}>
          {!item.isMine && isGroup && (
            <View style={styles.senderContainer}>
              <Image source={{ uri: item.senderAvatar || headerAvatar || '' }} style={styles.msgAvatarTop} />
              <Text style={styles.senderName}>{item.senderName}</Text>
            </View>
          )}
          
          <View style={[styles.bubbleWrapper, item.isMine && styles.bubbleWrapperMine]}>
            {!item.isMine && !isGroup && (
              <Image source={{ uri: headerAvatar || '' }} style={styles.msgAvatar} />
            )}
            
            <View style={[styles.bubbleFlexContainer, item.isMine && styles.bubbleFlexContainerMine]}>
              <SwipeableMessage isMine={item.isMine} onSwipe={() => setReplyingTo(item)}>
                <Animated.View 
                  style={[
                    styles.bubble, 
                    item.isMine ? styles.bubbleMine : styles.bubbleTheirs,
                    isGroup && !item.isMine && styles.bubbleGroup,
                    highlightedMessageId === item.id && {
                      opacity: highlightOpacity,
                      borderWidth: 2,
                      borderColor: colors.primary,
                    }
                  ]}
                >
                  <TouchableOpacity 
                    onLongPress={() => setReplyingTo(item)}
                    activeOpacity={0.9}
                  >
                  {item.replyToId && (
                    <TouchableOpacity onPress={() => item.replyToId && scrollToMessage(item.replyToId)} activeOpacity={0.7}>
                      <View style={[styles.replyQuote, item.isMine ? styles.replyQuoteMine : styles.replyQuoteTheirs]}>
                        <Text style={styles.replyQuoteUser}>{item.replyToUser}</Text>
                        {item.replyToImage && (
                          <Image source={{ uri: item.replyToImage }} style={styles.replyQuoteImage} />
                        )}
                        {item.replyToText && (
                          <Text style={styles.replyQuoteText} numberOfLines={1}>{item.replyToText}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}

                  {item.image && (
                    <Image source={{ uri: item.image }} style={styles.bubbleImage} />
                  )}
                  <View style={styles.bubbleContentRow}>
                    <View style={styles.bubbleTextColumn}>
                      {item.text ? (
                        <Text style={[styles.bubbleText, item.isMine && styles.bubbleTextMine]}>
                          {item.text}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={[styles.bubbleTime, item.isMine && styles.bubbleTimeMine]}>
                      {item.time}
                    </Text>
                  </View>
                </TouchableOpacity>
                </Animated.View>
              </SwipeableMessage>
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Messages' })}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {isGroup && headerAvatar ? (
            <Image source={{ uri: headerAvatar }} style={styles.headerAvatar} />
          ) : isGroup ? (
            <View style={styles.headerGroupAvatar}>
              <Ionicons name="people" size={20} color={colors.secondaryBlue} />
            </View>
          ) : (
            <Image source={{ uri: headerAvatar || 'https://gravatar.com/avatar/?d=mp' }} style={styles.headerAvatar} />
          )}
          <View>
            <Text style={styles.headerName}>{headerTitle}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.headerAction} onPress={() => setOptionsVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary }}>Cargando...</Text>
          </View>
        ) : (
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={(info) => {
            listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
          }}
        />
        )}

        {/* ── Input bar ── */}
        <View style={styles.inputContainer}>
          {replyingTo && (
            <View style={styles.replyPreviewBar}>
              <View style={styles.replyPreviewLine} />
              <View style={styles.replyPreviewContent}>
                <Text style={styles.replyPreviewUser}>
                  Respondiendo a {replyingTo.senderName || (replyingTo.isMine ? 'ti mismo' : headerTitle)}
                </Text>
                {replyingTo.image ? (
                  <View style={styles.replyPreviewImageContainer}>
                    <Image source={{ uri: replyingTo.image }} style={styles.replyPreviewImage} />
                  </View>
                ) : (
                  <Text style={styles.replyPreviewText} numberOfLines={1}>
                    {replyingTo.text}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {selectedImage && (
            <View style={styles.selectedImagePreview}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <TouchableOpacity 
                style={styles.removeImageBtn} 
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Message..."
                placeholderTextColor={colors.placeholder}
                multiline
                returnKeyType="send"
                onSubmitEditing={sendMessage}
              />
            </View>

            <TouchableOpacity
              style={[styles.sendBtn, !input.trim() && !selectedImage && styles.sendBtnDisabled]}
              onPress={sendMessage}
              disabled={!input.trim() && !selectedImage}
            >
              <Ionicons name="send" size={20} color={colors.canvasPure} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Simple options modal */}
      {optionsVisible && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setOptionsVisible(false)} />
          <View
            style={{
              backgroundColor: colors.canvasPure,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              padding: 16,
            }}
          >
            {isGroup ? (
              <TouchableOpacity
                onPress={() => {
                  setOptionsVisible(false);
                  navigation.navigate('EditGroup', { conversationId });
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
              >
                <Ionicons name="pencil-outline" size={22} color={colors.textPrimary} />
                <Text style={{ marginLeft: 10, color: colors.textPrimary, fontWeight: '700' }}>Editar grupo</Text>
              </TouchableOpacity>
            ) : !isGroup && otherUserId ? (
              <TouchableOpacity
                onPress={handleBlockFromChat}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
              >
                <Ionicons name="ban-outline" size={22} color="#FF5252" />
                <Text style={{ marginLeft: 10, color: '#FF5252', fontWeight: '700' }}>Bloquear usuario</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={() => {
                setOptionsVisible(false);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
            >
              <Ionicons name="close-outline" size={22} color={colors.textPrimary} />
              <Text style={{ marginLeft: 10, color: colors.textPrimary, fontWeight: '700' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

