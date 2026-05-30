import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Modal,
  Dimensions,
  ActivityIndicator,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/social/chatScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { Shadows } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useUnreadMessages } from '../../context/UnreadMessagesContext';
import { supabase } from '../../lib/supabase';
import { MessageRepository } from '../../repositories/message.repository';
import { UserBlockRepository } from '../../repositories/user_block.repository';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { handleError } from '../../utils/errorHandler';
import AppToast from '../../components/AppToast';
import { Message } from '../../types/message';

type ChatNavProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

// ── Componentes memoizados ─────────────────────────────────────────────────────
const SwipeableMessage = React.memo(({ children, onSwipe, isMine }: { children: React.ReactNode, onSwipe: () => void, isMine: boolean }) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
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
});

const MessageItem = React.memo(({
  item,
  index,
  previousMessageCreatedAt,
  headerAvatar,
  isGroup,
  highlightedMessageId,
  highlightBorderWidth,
  colors,
  styles,
  setReplyingTo,
  scrollToMessage,
  setFullScreenImage,
}: {
  item: Message;
  index: number;
  previousMessageCreatedAt: string | undefined;
  headerAvatar: string | null;
  isGroup: boolean;
  highlightedMessageId: string | null;
  highlightBorderWidth: Animated.Value;
  colors: any;
  styles: any;
  setReplyingTo: (msg: Message) => void;
  scrollToMessage: (id: string) => void;
  setFullScreenImage: (url: string | null) => void;
}) => {
  const formatDateLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  const showDateLabel = index === 0 || (
    item.createdAt &&
    previousMessageCreatedAt &&
    formatDateLabel(new Date(item.createdAt)) !== formatDateLabel(new Date(previousMessageCreatedAt))
  );

  return (
    <>
      {showDateLabel && item.createdAt && (
        <View style={styles.dateLabelContainer}>
          <Text style={styles.dateLabel}>{formatDateLabel(new Date(item.createdAt))}</Text>
        </View>
      )}
      <View style={[styles.msgRow, item.isMine && styles.msgRowMine]}>
        {!item.isMine && isGroup && (
          <View style={styles.senderContainer}>
            <Image source={{ uri: item.senderAvatar || headerAvatar || 'https://gravatar.com/avatar/?d=mp' }} style={styles.msgAvatarTop} />
            <Text style={styles.senderName}>{item.senderName}</Text>
          </View>
        )}

        <View style={[styles.bubbleWrapper, item.isMine && styles.bubbleWrapperMine]}>
          {!item.isMine && !isGroup && (
            <Image source={{ uri: headerAvatar || 'https://gravatar.com/avatar/?d=mp' }} style={styles.msgAvatar} />
          )}

          <View style={[styles.bubbleFlexContainer, item.isMine && styles.bubbleFlexContainerMine]}>
            <SwipeableMessage isMine={item.isMine} onSwipe={() => setReplyingTo(item)}>
              <Animated.View
                style={[
                  styles.bubble,
                  item.isMine ? styles.bubbleMine : styles.bubbleTheirs,
                  isGroup && !item.isMine && styles.bubbleGroup,
                  highlightedMessageId === item.id && {
                    borderWidth: highlightBorderWidth,
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
                      {item.replyToImage && item.replyToImage.trim() !== '' && (
                        <Image source={{ uri: item.replyToImage }} style={styles.replyQuoteImage} />
                      )}
                      {item.replyToText && (
                        <Text style={styles.replyQuoteText} numberOfLines={1}>{item.replyToText}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}

                {item.image && item.image.trim() !== '' && (
                  <TouchableOpacity onPress={() => item.image && setFullScreenImage(item.image)} activeOpacity={0.8}>
                    <Image source={{ uri: item.image }} style={styles.bubbleImage} />
                  </TouchableOpacity>
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
});

// ── Componente ────────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const navigation = useNavigation<ChatNavProp>();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const route = useRoute<ChatRouteProp>();
  const { conversationId } = route.params;
  const { user } = useAuth();
  const { messagesMap, fetchMessages, hasMoreMap, loadMoreMessages } = useUnreadMessages();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);
  const loadingMore = useRef(false);
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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollButtonAnim = useRef(new Animated.Value(0)).current;
  const initialScrollDone = useRef(false);
  const [headerReady, setHeaderReady] = useState(false);
  const [scrollDone, setScrollDone] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const overlayPulse = useRef(new Animated.Value(0)).current;
  const overlayLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
  const [visibleMessageId, setVisibleMessageId] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const isNearBottomRef = useRef(true);

  // Caché de header de conversación para evitar re-fetch
  const conversationCache = useRef<Map<string, {
    title: string;
    avatar: string | null;
    isGroup: boolean;
    otherUserId: string | null;
  }>>(new Map());

  // Ref para la suscripción de lectura en tiempo real
  const readStatusChannelRef = useRef<any>(null);

  // Suscripción a cambios en conversation_member_states para actualizar isRead en tiempo real
  useEffect(() => {
    if (!user) return;

    // Limpiar canal anterior si existe
    if (readStatusChannelRef.current) {
      supabase.removeChannel(readStatusChannelRef.current);
      readStatusChannelRef.current = null;
    }

    const channelName = `chat-read-status-${conversationId}-${user.id}`;
    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_member_states',
          filter: `conversation_id=eq.${conversationId}&user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newLastReadId = (payload.new as any)?.last_read_message_id;

          if (newLastReadId) {
            setLastReadMessageId(newLastReadId);

            // Actualizar isRead de los mensajes existentes sin recargar desde DB
            setMessages((prevMessages) => {
              const lastReadIndex = prevMessages.findIndex((m) => m.id === newLastReadId);

              if (lastReadIndex !== -1) {
                // El mensaje está en el array actual: marcar hasta ese índice
                return prevMessages.map((m, idx) => ({
                  ...m,
                  isRead: idx <= lastReadIndex,
                }));
              } else {
                // El mensaje no está en el array actual (caso de paginación)
                // Por defecto, no cambiar nada (el usuario puede scrollear para cargar más)
                return prevMessages;
              }
            });

            // Si el mensaje no está en el array actual, verificar si todos deberían marcarse como leídos
            const lastReadIndex = messages.findIndex((m) => m.id === newLastReadId);
            if (lastReadIndex === -1) {
              const { data: lastReadMsg } = await supabase
                .from('messages')
                .select('created_at')
                .eq('id', newLastReadId)
                .single();

              if (lastReadMsg?.created_at && messages.length > 0) {
                const lastReadDate = new Date(lastReadMsg.created_at).getTime();
                const firstMsgDate = messages[0].createdAt
                  ? new Date(messages[0].createdAt).getTime()
                  : 0;

                // Si el lastRead es más viejo que el primer mensaje cargado, marcar todos como leídos
                if (lastReadDate <= firstMsgDate) {
                  setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
                }
              }
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to read status updates');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          readStatusChannelRef.current = null;
        }
      });

    readStatusChannelRef.current = channel;

    return () => {
      if (readStatusChannelRef.current) {
        supabase.removeChannel(readStatusChannelRef.current);
        readStatusChannelRef.current = null;
      }
    };
  }, [conversationId, user?.id]);

  // Animación del botón scroll-to-bottom
  useEffect(() => {
    Animated.spring(scrollButtonAnim, {
      toValue: showScrollButton ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [showScrollButton]);

  // Animación del overlay de carga (latido + fade-out suave)
  // El overlay solo se quita cuando headerReady Y scrollDone son ambos true
  const overlayReady = headerReady && scrollDone;
  useEffect(() => {
    if (!overlayReady) {
      setOverlayVisible(true);
      overlayOpacity.setValue(1);
      overlayPulse.setValue(0);
      // Efecto latido continuo
      overlayLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(overlayPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(overlayPulse, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );
      overlayLoopRef.current.start();
    } else {
      overlayLoopRef.current?.stop();
      overlayLoopRef.current = null;
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start(() => {
        setOverlayVisible(false);
      });
    }
  }, [overlayReady]);

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

  useEffect(() => {
    let mounted = true;
    initialScrollDone.current = false;
    setHeaderReady(false);
    setScrollDone(false);

    // Usar mensajes globales si existen
    const globalMessages = messagesMap[conversationId];
    if (globalMessages) {
      setMessages(globalMessages);
    }

    // Usar caché de header si existe
    const cached = conversationCache.current.get(conversationId);
    if (cached) {
      setHeaderTitle(cached.title);
      setHeaderAvatar(cached.avatar);
      setIsGroup(cached.isGroup);
      setOtherUserId(cached.otherUserId);
      setHeaderReady(true);
    }

    const load = async () => {
      if (!user) return;
      try {
        const hasGlobal = !!globalMessages;
        const hasCache = !!cached;
        if (!hasGlobal && !hasCache) setLoading(true);

        // Parallel queries: conversation + scroll positions
        const [conv, lastReadId, visibleId] = await Promise.all([
          hasCache ? Promise.resolve(null) : supabase
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
            .maybeSingle(),
          ConversationRepository.getLastReadMessageId(conversationId, user.id),
          ConversationRepository.getVisibleMessageId(conversationId, user.id),
        ]);

        if (conv && conv.error) throw conv.error;

        if (conv && !conv.data) {
          if (mounted) {
            setConversationExists(false);
            setLoading(false);
            setHeaderReady(true);
            setScrollDone(true);
          }
          return;
        }

        if (conv && conv.data) {
          const members = conv.data?.members || [];
          const otherMember = members.find((m: any) => m.user_id !== user.id);
          const other = Array.isArray(otherMember?.users) ? otherMember?.users[0] : otherMember?.users;

          const headerData = {
            title: conv.data?.is_group ? (conv.data?.name || 'Group') : (other?.fullname || other?.username || 'Usuario'),
            avatar: conv.data?.is_group ? (conv.data?.avatar_url || null) : (other?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp'),
            isGroup: Boolean(conv.data?.is_group),
            otherUserId: conv.data?.is_group ? null : (other?.id || null),
          };

          // Guardar en caché
          conversationCache.current.set(conversationId, headerData);

          if (mounted) {
            setConversationExists(true);
            setIsGroup(headerData.isGroup);
            setHeaderTitle(headerData.title);
            setHeaderAvatar(headerData.avatar);
            setOtherUserId(headerData.otherUserId);
            setHeaderReady(true);
          }

          // If direct chat and blocked either direction, disable loading messages
          if (!headerData.isGroup && other?.id) {
            const [iBlocked, theyBlocked] = await Promise.all([
              UserBlockRepository.isBlocked(user.id, other.id),
              UserBlockRepository.isBlocked(other.id, user.id),
            ]);
            if (iBlocked || theyBlocked) {
              if (mounted) {
                setMessages([]);
                setLoading(false);
                setScrollDone(true);
              }
              return;
            }
          }
        }

        if (mounted) {
          setLastReadMessageId(lastReadId);
          setVisibleMessageId(visibleId);
        }

        // Si no hay mensajes globales, cargarlos
        if (!hasGlobal) {
          await fetchMessages(conversationId);
        }

        if (mounted) {
          if (initialScrollDone.current) {
            setScrollDone(true);
          }
        }
      } catch (e) {
        handleError(e, setToast, 'No se pudo cargar el chat');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, user?.id, navigation]);

  // Sincronizar mensajes locales con el mapa global cuando cambia
  useEffect(() => {
    const global = messagesMap[conversationId];
    if (!global) return;

    setMessages((prevLocal) => {
      // Si no hay mensajes locales, usar los globales directamente
      if (prevLocal.length === 0) return global;

      // Si los extremos son diferentes, hay nuevos mensajes o se cargaron más
      if (
        prevLocal.length !== global.length ||
        prevLocal[0]?.id !== global[0]?.id ||
        prevLocal[prevLocal.length - 1]?.id !== global[global.length - 1]?.id
      ) {
        return global;
      }

      // Solo actualizar isRead para evitar re-renders innecesarios
      const hasReadDiff = global.some((g, i) => {
        const local = prevLocal[i];
        return local && g.isRead !== local.isRead;
      });

      if (hasReadDiff) {
        return prevLocal.map((local, i) => {
          const g = global[i];
          if (!g) return local;
          return g.isRead !== local.isRead ? { ...local, isRead: g.isRead } : local;
        });
      }

      return prevLocal;
    });
  }, [messagesMap, conversationId]);

  // Scroll inicial: posicionar en el primer mensaje no leído (estilo WhatsApp)
  // Guardar último mensaje visible (bottom-most) como posición de scroll
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: Array<{ item: Message }> }) => {
    if (viewableItems.length === 0) return;

    // Crear Map de id -> índice para O(1) lookups en lugar de O(n) findIndex
    const messageIndexMap = new Map<string, number>();
    messages.forEach((m, idx) => messageIndexMap.set(m.id, idx));

    // El último visible = el más abajo en la lista (mayor índice)
    const bottomMost = [...viewableItems].sort((a, b) => {
      const aIdx = messageIndexMap.get(a.item.id) ?? -1;
      const bIdx = messageIndexMap.get(b.item.id) ?? -1;
      return bIdx - aIdx;
    })[0];

    const id = bottomMost.item.id;
    setVisibleMessageId(id);
    // Persistir en DB
    if (user) {
      ConversationRepository.upsertVisibleMessage(conversationId, user.id, id).catch(() => {});
    }
  }, [messages, conversationId, user?.id]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 500,
  }).current;

  const performInitialScroll = useCallback(() => {
    if (initialScrollDone.current) return;

    if (!messages.length) {
      setScrollDone(true);
      return;
    }

    let targetIndex = -1;

    // Caso 1: existen mensajes no leídos
    if (lastReadMessageId) {
      const lastReadIdx = messages.findIndex(
        m => m.id === lastReadMessageId
      );

      if (
        lastReadIdx !== -1 &&
        lastReadIdx < messages.length - 1
      ) {
        targetIndex = lastReadIdx + 1;
      }
    }

    // Caso 2: todos leídos → volver a posición guardada
    else if (visibleMessageId) {
      const visibleIdx = messages.findIndex(
        m => m.id === visibleMessageId
      );

      if (visibleIdx !== -1) {
        targetIndex = visibleIdx;
      }
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          if (targetIndex >= 0) {
            listRef.current?.scrollToIndex({
              index: targetIndex,
              animated: false,
              viewPosition: lastReadMessageId ? 0 : 1,
            });
          } else {
            listRef.current?.scrollToEnd({
              animated: false,
            });
          }

          initialScrollDone.current = true;
          setScrollDone(true);
        } catch {
          listRef.current?.scrollToEnd({
            animated: false,
          });

          initialScrollDone.current = true;
          setScrollDone(true);
        }
      }, 50);
    });
  }, [
    messages,
    lastReadMessageId,
    visibleMessageId,
  ]);

  useEffect(() => {
    if (initialScrollDone.current) return;

    if (!headerReady) return;

    if (!messages.length) {
      setScrollDone(true);
      return;
    }

    performInitialScroll();
  }, [
    headerReady,
    messages,
    lastReadMessageId,
    visibleMessageId,
    performInitialScroll,
  ]);

  // Si headerReady llega después del scroll, marcar listo
  useEffect(() => {
    if (headerReady && initialScrollDone.current && !scrollDone) {
      setScrollDone(true);
    }
  }, [headerReady, scrollDone]);

  useFocusEffect(
    useCallback(() => {
      // Skip refresh if conversation is already cached
      if (conversationCache.current.has(conversationId)) {
        return;
      }

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
          handleError(e, setToast, 'Error refreshing conversation');
        }
      };

      refreshConversation();
    }, [conversationId, user?.id])
  );

  useEffect(() => {
    initialScrollDone.current = false;
    setScrollDone(false);
  }, [conversationId]);

  // Actualizaciones posteriores (mensajes nuevos en tiempo real)
  useEffect(() => {
    if (messages.length === 0 || !initialScrollDone.current) return;

    const lastMessage = messages[messages.length - 1];

    // No es primera carga: no scrollear si el último mensaje es mío
    // (sendMessage ya se encarga de eso)
    if (lastMessage?.isMine) return;

    // Mensaje nuevo de otro usuario: scrollear al final para mostrarlo
    const timeoutId = setTimeout(() => {
      if (isNearBottomRef.current) {
        listRef.current?.scrollToEnd({
          animated: true,
        });
      }
    }, 100);

    // Marcar como leído hasta el último mensaje
    if (user && lastMessage) {
      console.log('[ChatScreen] Marking as read:', lastMessage.id);
      ConversationRepository.upsertLastReadMessageId(conversationId, user.id, lastMessage.id).catch(e => {
        console.error('[ChatScreen] Error marking as read:', e);
        handleError(e, setToast, 'Error marking messages as read');
      });
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [messages, user?.id]);

  // Marcar mensajes como leídos al abrir el chat si hay mensajes no leídos
  useEffect(() => {
    if (!headerReady || !initialScrollDone.current || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (user && lastMessage && !lastMessage.isMine && !lastMessage.isRead) {
      console.log('[ChatScreen] Opening chat - marking last message as read:', lastMessage.id);
      ConversationRepository.upsertLastReadMessageId(conversationId, user.id, lastMessage.id).catch(e => {
        console.error('[ChatScreen] Error marking as read on open:', e);
      });
    }
  }, [headerReady, messages, user?.id, conversationId]);

  const checkScrollPosition = useCallback((offsetY: number, contentH: number, layoutH: number) => {
    if (contentH <= layoutH) {
      setShowScrollButton(false);
      return;
    }
    const distanceFromBottom = contentH - offsetY - layoutH;
    setShowScrollButton(distanceFromBottom > 200);
  }, []);

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

    // Guardar datos del reply antes de limpiar el estado
    const replyToId = replyingTo?.id || null;
    const replyToText = replyingTo?.text;
    const replyToUser = replyingTo?.senderName || (replyingTo?.isMine ? 'Tú' : headerTitle);
    const replyToImage = replyingTo?.image;

    const newMsg: Message = {
      id: Date.now().toString(),
      text: text || '',
      image: selectedImage || undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      replyToId: replyToId || undefined,
      replyToText,
      replyToUser,
      replyToImage,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setSelectedImage(null);
    setReplyingTo(null);

    // Scroll to end immediately after adding the message
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);

    try {
      await MessageRepository.send({
        conversationId,
        senderId: user.id,
        content: text || null,
        imageUrl: selectedImage || null,
        replyToId,
      });
    } catch (e) {
      handleError(e, setToast, 'No se pudo enviar el mensaje');
    }
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      handleError('Permiso denegado', setToast, 'Se necesita permiso para acceder a la galería.');
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

  const scrollToMessage = (replyToId: string) => {
    const index = messages.findIndex((msg) => msg.id === replyToId);
    if (index !== -1) {
      setHighlightedMessageId(replyToId);
      highlightBorderWidth.setValue(2);

      // Border width fade out animation
      Animated.sequence([
        Animated.timing(highlightBorderWidth, {
          toValue: 2,
          duration: 0,
          useNativeDriver: false,
        }),
        Animated.timing(highlightBorderWidth, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
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

  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    const previousMessageCreatedAt = index > 0 ? messages[index - 1]?.createdAt : undefined;
    return (
      <MessageItem
        item={item}
        index={index}
        previousMessageCreatedAt={previousMessageCreatedAt}
        headerAvatar={headerAvatar}
        isGroup={isGroup}
        highlightedMessageId={highlightedMessageId}
        highlightBorderWidth={highlightBorderWidth}
        colors={colors}
        styles={styles}
        setReplyingTo={setReplyingTo}
        scrollToMessage={scrollToMessage}
        setFullScreenImage={setFullScreenImage}
      />
    );
  }, [messages, headerAvatar, isGroup, highlightedMessageId, highlightBorderWidth, colors, styles, setReplyingTo, scrollToMessage, setFullScreenImage]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {isGroup && headerAvatar ? (
            <Image source={{ uri: headerAvatar || 'https://gravatar.com/avatar/?d=mp' }} style={styles.headerAvatar} />
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
        <View style={{ flex: 1 }}>
          <FlatList
              key={`chatlist-${conversationId}`}
              ref={listRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
              onScroll={(event) => {
                const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

                const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;

                isNearBottomRef.current = distanceFromBottom < 150;

                checkScrollPosition(contentOffset?.y ?? 0, contentSize?.height ?? 0, layoutMeasurement?.height ?? 0);

                // Cargar mensajes más viejos al acercarse al tope (arriba)
                if (contentOffset.y < 100 && hasMoreMap[conversationId] && !loadingMore.current) {
                  loadingMore.current = true;
                  loadMoreMessages(conversationId).finally(() => {
                    loadingMore.current = false;
                  });
                }
              }}
              onMomentumScrollEnd={(event) => {
                const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
                checkScrollPosition(contentOffset?.y ?? 0, contentSize?.height ?? 0, layoutMeasurement?.height ?? 0);
              }}
              onScrollEndDrag={(event) => {
                const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
                checkScrollPosition(contentOffset?.y ?? 0, contentSize?.height ?? 0, layoutMeasurement?.height ?? 0);
              }}
              scrollEventThrottle={16}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={15}
              updateCellsBatchingPeriod={50}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              onScrollToIndexFailed={(info) => {
                setTimeout(() => {
                  listRef.current?.scrollToIndex({
                    index: info.index,
                    animated: false,
                  });
                }, 300);
              }}
            />
            {overlayVisible && (
              <Animated.View
                style={[StyleSheet.absoluteFill, {
                  backgroundColor: colors.canvasPure,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: overlayOpacity,
                }]}
                pointerEvents="auto"
              >
                <Animated.View
                  style={{
                    opacity: overlayPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 1],
                    }),
                    transform: [{
                      scale: overlayPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.92, 1.08],
                      }),
                    }],
                  }}
                >
                  <View style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: colors.primary,
                    opacity: 0.15,
                  }} />
                </Animated.View>
              </Animated.View>
            )}

            <Animated.View
              pointerEvents={showScrollButton ? 'auto' : 'none'}
              style={{
                position: 'absolute',
                bottom: Platform.OS === 'ios' ? 140 : 120,
                right: 16,
                width: 44,
                height: 44,
                zIndex: 50,
                opacity: scrollButtonAnim,
                transform: [{
                  scale: scrollButtonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                    extrapolate: 'clamp',
                  }),
                }],
              }}
            >
              <TouchableOpacity
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  ...Shadows.active,
                }}
                activeOpacity={0.85}
                onPress={() => {
                  listRef.current?.scrollToEnd({ animated: true });
                  setShowScrollButton(false);
                }}
              >
                <Ionicons name="arrow-down" size={22} color={colors.white} />
              </TouchableOpacity>
            </Animated.View>
          </View>

        {/* ── Input bar ── */}
        <View style={styles.inputContainer}>
          {replyingTo && (
            <View style={styles.replyPreviewBar}>
              <View style={styles.replyPreviewLine} />
              <View style={styles.replyPreviewContent}>
                <Text style={styles.replyPreviewUser}>
                  Respondiendo a {replyingTo.senderName || (replyingTo.isMine ? 'ti mismo' : headerTitle)}
                </Text>
                {replyingTo.image && replyingTo.image.trim() !== '' ? (
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
              {selectedImage && selectedImage.trim() !== '' && (
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              )}
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
              <>
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
                <TouchableOpacity
                  onPress={() => {
                    setOptionsVisible(false);
                    setShowLeaveModal(true);
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
                >
                  <Ionicons name="exit-outline" size={22} color="#FF5252" />
                  <Text style={{ marginLeft: 10, color: '#FF5252', fontWeight: '700' }}>Salir del grupo</Text>
                </TouchableOpacity>
              </>
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

      {/* Leave Group Confirmation Modal */}
      <Modal
        visible={showLeaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: colors.canvasPure, borderRadius: 16, padding: 20, width: '100%', maxWidth: 400 }}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="exit-outline" size={48} color="#FF5252" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 }}>Salir del grupo</Text>
            <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 22 }}>
              ¿Estás seguro de que quieres salir de este grupo? Ya no podrás ver ni enviar mensajes.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.componentBase, alignItems: 'center' }}
                onPress={() => setShowLeaveModal(false)}
                disabled={leaving}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#FF5252', alignItems: 'center' }}
                onPress={handleLeaveGroup}
                disabled={leaving}
              >
                {leaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Salir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full screen image modal */}
      <Modal
        visible={fullScreenImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 1 }}
            onPress={() => setFullScreenImage(null)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          {fullScreenImage && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setFullScreenImage(null)}
            >
              <Image
                source={{ uri: fullScreenImage }}
                style={{ 
                  width: Dimensions.get('window').width, 
                  height: Dimensions.get('window').height * 0.6,
                  resizeMode: 'contain' 
                }}
              />
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}



