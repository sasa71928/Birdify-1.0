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
import {
  useNavigation,
  useRoute,
  useFocusEffect,
  RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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

// ── SwipeableMessage ──────────────────────────────────────────────────────────
const SwipeableMessage = React.memo(
  ({
    children,
    onSwipe,
    isMine,
  }: {
    children: React.ReactNode;
    onSwipe: () => void;
    isMine: boolean;
  }) => {
    const translateX = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gs) =>
          Math.abs(gs.dx) > 10 && gs.dx > 0 && !isMine,
        onPanResponderMove: (_, gs) => {
          if (gs.dx > 0 && gs.dx < 80) translateX.setValue(gs.dx);
        },
        onPanResponderRelease: (_, gs) => {
          if (gs.dx > 50) onSwipe();
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
  }
);

// ── MessageItem ───────────────────────────────────────────────────────────────
const MessageItem = React.memo(
  ({
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
      if (date.toDateString() === today.toDateString()) return 'Hoy';
      if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    };

    const showDateLabel =
      index === 0 ||
      (item.createdAt &&
        previousMessageCreatedAt &&
        formatDateLabel(new Date(item.createdAt)) !==
          formatDateLabel(new Date(previousMessageCreatedAt)));

    return (
      <>
        {showDateLabel && item.createdAt && (
          <View style={styles.dateLabelContainer}>
            <Text style={styles.dateLabel}>
              {formatDateLabel(new Date(item.createdAt))}
            </Text>
          </View>
        )}
        <View style={[styles.msgRow, item.isMine && styles.msgRowMine]}>
          {!item.isMine && isGroup && (
            <View style={styles.senderContainer}>
              <Image
                source={{
                  uri:
                    item.senderAvatar ||
                    headerAvatar ||
                    'https://gravatar.com/avatar/?d=mp',
                }}
                style={styles.msgAvatarTop}
              />
              <Text style={styles.senderName}>{item.senderName}</Text>
            </View>
          )}

          <View
            style={[
              styles.bubbleWrapper,
              item.isMine && styles.bubbleWrapperMine,
            ]}
          >
            {!item.isMine && !isGroup && (
              <Image
                source={{
                  uri: headerAvatar || 'https://gravatar.com/avatar/?d=mp',
                }}
                style={styles.msgAvatar}
              />
            )}

            <View
              style={[
                styles.bubbleFlexContainer,
                item.isMine && styles.bubbleFlexContainerMine,
              ]}
            >
              <SwipeableMessage isMine={item.isMine} onSwipe={() => setReplyingTo(item)}>
                <Animated.View
                  style={[
                    styles.bubble,
                    item.isMine ? styles.bubbleMine : styles.bubbleTheirs,
                    isGroup && !item.isMine && styles.bubbleGroup,
                    highlightedMessageId === item.id && {
                      borderWidth: highlightBorderWidth,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onLongPress={() => setReplyingTo(item)}
                    activeOpacity={0.9}
                  >
                    {item.replyToId && (
                      <TouchableOpacity
                        onPress={() =>
                          item.replyToId && scrollToMessage(item.replyToId)
                        }
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.replyQuote,
                            item.isMine
                              ? styles.replyQuoteMine
                              : styles.replyQuoteTheirs,
                          ]}
                        >
                          <Text style={styles.replyQuoteUser}>
                            {item.replyToUser}
                          </Text>
                          {item.replyToImage &&
                            item.replyToImage.trim() !== '' && (
                              <Image
                                source={{ uri: item.replyToImage }}
                                style={styles.replyQuoteImage}
                              />
                            )}
                          {item.replyToText && (
                            <Text
                              style={styles.replyQuoteText}
                              numberOfLines={1}
                            >
                              {item.replyToText}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    )}

                    {item.image && item.image.trim() !== '' && (
                      <TouchableOpacity
                        onPress={() =>
                          item.image && setFullScreenImage(item.image)
                        }
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: item.image }}
                          style={styles.bubbleImage}
                        />
                      </TouchableOpacity>
                    )}

                    <View style={styles.bubbleContentRow}>
                      <View style={styles.bubbleTextColumn}>
                        {item.text ? (
                          <Text
                            style={[
                              styles.bubbleText,
                              item.isMine && styles.bubbleTextMine,
                            ]}
                          >
                            {item.text}
                          </Text>
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.bubbleTime,
                          item.isMine && styles.bubbleTimeMine,
                        ]}
                      >
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
  }
);

// ── ChatScreen ────────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const navigation = useNavigation<ChatNavProp>();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const route = useRoute<ChatRouteProp>();
  const { conversationId } = route.params;
  const { user } = useAuth();
  const {
    messagesMap,
    fetchMessages,
    hasMoreMap,
    loadMoreMessages,
  } = useUnreadMessages();

  // ── Mensajes desde el contexto global (única fuente de verdad) ─────────────
  const messages = messagesMap[conversationId] ?? [];

  // ── Estado de UI ───────────────────────────────────────────────────────────
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });

  // ── Estado de scroll inicial ───────────────────────────────────────────────
  // headerReady: datos del header cargados (nombre, avatar)
  // readStatusLoaded: lastReadMessageId y visibleMessageId cargados desde BD
  // scrollDone: el scroll inicial ya se ejecutó
  const [headerReady, setHeaderReady] = useState(false);
  const [readStatusLoaded, setReadStatusLoaded] = useState(false);
  const [scrollDone, setScrollDone] = useState(false);
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
  const [visibleMessageId, setVisibleMessageId] = useState<string | null>(null);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const listRef = useRef<FlatList>(null);
  const loadingMore = useRef(false);
  const initialScrollDone = useRef(false);
  const isNearBottomRef = useRef(false);
  const currentTopVisibleRef = useRef<string | null>(null);
  const lastSavedVisibleRef = useRef<string | null>(null);
  const visibleMessageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // CAMBIO 3: flatListReady + pendingScrollTarget para manejar scroll antes de
  // que el FlatList haya terminado su layout
  const flatListReady = useRef(false);
  const pendingScrollTarget = useRef<{
    index: number;
    viewPosition: number;
  } | null>(null);

  // Overlay de carga (visible hasta que headerReady && scrollDone)
  const [overlayVisible, setOverlayVisible] = useState(true);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const overlayPulse = useRef(new Animated.Value(0)).current;
  const overlayLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Caché de header para evitar re-fetches innecesarios
  const conversationCache = useRef<
    Map<
      string,
      {
        title: string;
        avatar: string | null;
        isGroup: boolean;
        otherUserId: string | null;
      }
    >
  >(new Map());

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (visibleMessageTimeout.current) clearTimeout(visibleMessageTimeout.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // ── Reset al cambiar de conversación ──────────────────────────────────────
  useEffect(() => {
    initialScrollDone.current = false;
    flatListReady.current = false;
    pendingScrollTarget.current = null;
    setScrollDone(false);
    setReadStatusLoaded(false);
    setHeaderReady(false);
    setLastReadMessageId(null);
    setVisibleMessageId(null);
    setOverlayVisible(true);
    overlayOpacity.setValue(1);
  }, [conversationId]);

  // ── Animación botón scroll-to-bottom ──────────────────────────────────────
  useEffect(() => {
    Animated.spring(scrollButtonAnim, {
      toValue: showScrollButton ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [showScrollButton]);

  // ── Animación overlay de carga ─────────────────────────────────────────────
  const overlayReady = headerReady && scrollDone;
  useEffect(() => {
    if (!overlayReady) {
      setOverlayVisible(true);
      overlayOpacity.setValue(1);
      overlayPulse.setValue(0);
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
      }).start(() => setOverlayVisible(false));
    }
  }, [overlayReady]);

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, message, type });
    toastTimeoutRef.current = setTimeout(
      () => setToast((prev) => ({ ...prev, visible: false })),
      3600
    );
  };

  // ── markConversationAsRead ─────────────────────────────────────────────────
  // Marca como leído el último mensaje ajeno visible.
  // Se llama: (1) al terminar el scroll inicial, (2) cuando llega un mensaje
  // nuevo y el usuario está al fondo, (3) al ganar el foco.
  const markConversationAsRead = useCallback(async () => {
    if (!user || messages.length === 0) return;

    // Buscar el último mensaje que NO sea mío (el que el receptor debe "leer")
    let lastIncomingMsg: Message | null = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].isMine) {
        lastIncomingMsg = messages[i];
        break;
      }
    }

    // Si todos los mensajes son míos no hay nada que marcar
    if (!lastIncomingMsg) return;

    // Evitar llamadas repetidas con el mismo ID
    if (lastIncomingMsg.id === lastReadMessageId) return;

    try {
      await ConversationRepository.upsertLastReadMessageId(
        conversationId,
        user.id,
        lastIncomingMsg.id
      );
      setLastReadMessageId(lastIncomingMsg.id);
    } catch (e) {
      console.error('[ChatScreen] Error marking as read:', e);
    }
  }, [user?.id, messages, conversationId, lastReadMessageId]);

  // ── CAMBIO 3: función central de scroll ───────────────────────────────────
  // Ejecuta el scroll si el FlatList ya hizo su layout; si no, guarda el
  // target como pendiente para ejecutarlo en onLayout.
  const executeScroll = useCallback(
    (targetIndex: number, viewPosition: number) => {
      const doIt = () => {
        try {
          if (targetIndex >= 0) {
            listRef.current?.scrollToIndex({
              index: targetIndex,
              animated: false,
              viewPosition,
            });
          } else {
            listRef.current?.scrollToEnd({ animated: false });
          }
          initialScrollDone.current = true;
          setScrollDone(true);
        } catch {
          // Si scrollToIndex falla (item no renderizado), ir al final
          listRef.current?.scrollToEnd({ animated: false });
          initialScrollDone.current = true;
          setScrollDone(true);
        }
      };

      if (!flatListReady.current) {
        // FlatList no está listo: guardar el target para cuando haga onLayout
        pendingScrollTarget.current = { index: targetIndex, viewPosition };
        return;
      }

      // CAMBIO 5: doble requestAnimationFrame en lugar de setTimeout 50ms
      requestAnimationFrame(() => {
        requestAnimationFrame(doIt);
      });
    },
    []
  );

  // ── performInitialScroll ───────────────────────────────────────────────────
  const performInitialScroll = useCallback(() => {
    if (initialScrollDone.current) return;

    if (!messages.length) {
      initialScrollDone.current = true;
      setScrollDone(true);
      return;
    }

    let targetIndex = -1;
    let viewPosition = 0;

    if (lastReadMessageId) {
      const lastReadIdx = messages.findIndex((m) => m.id === lastReadMessageId);
      const hasUnread =
        lastReadIdx !== -1 && lastReadIdx < messages.length - 1;

      if (hasUnread) {
        // Primer mensaje no leído (posición tipo WhatsApp)
        targetIndex = lastReadIdx + 1;
        viewPosition = 0.35;
      } else if (visibleMessageId) {
        const visibleIdx = messages.findIndex((m) => m.id === visibleMessageId);
        if (visibleIdx !== -1) {
          targetIndex = visibleIdx;
          viewPosition = 0;
        }
      }
    } else if (visibleMessageId) {
      const visibleIdx = messages.findIndex((m) => m.id === visibleMessageId);
      if (visibleIdx !== -1) {
        targetIndex = visibleIdx;
        viewPosition = 0;
      }
    }

    executeScroll(targetIndex, viewPosition);
  }, [messages, lastReadMessageId, visibleMessageId, executeScroll]);

  // ── CAMBIO 1: Carga principal ──────────────────────────────────────────────
  // Orden garantizado:
  //   1. Cargar conv + lastReadId + visibleId en paralelo
  //   2. setReadStatusLoaded(true)  ← ANTES de fetchMessages
  //   3. Cargar mensajes si no están en memoria
  useEffect(() => {
    let mounted = true;
    initialScrollDone.current = false;
    flatListReady.current = false;
    pendingScrollTarget.current = null;

    const hasGlobal = !!messagesMap[conversationId];
    const cached = conversationCache.current.get(conversationId);

    // Aplicar caché de header inmediatamente si existe
    if (cached) {
      setHeaderTitle(cached.title);
      setHeaderAvatar(cached.avatar);
      setIsGroup(cached.isGroup);
      setOtherUserId(cached.otherUserId);
      setHeaderReady(true);
    }

    if (!hasGlobal && !cached) setLoading(true);

    const load = async () => {
      if (!user) return;
      try {
        // ── PASO 1: datos de posición + conv en paralelo ─────────────────────
        const [convResult, lastReadId, visibleId] = await Promise.all([
          cached
            ? Promise.resolve(null)
            : supabase
                .from('conversations')
                .select(
                  `id, name, avatar_url, is_group,
                   members:conversation_members (
                     user_id,
                     users (id, username, fullname, profile_pic_url)
                   )`
                )
                .eq('id', conversationId)
                .maybeSingle(),
          ConversationRepository.getLastReadMessageId(conversationId, user.id),
          ConversationRepository.getVisibleMessageId(conversationId, user.id),
        ]);

        if (!mounted) return;

        // Procesar conv si no estaba en caché
        if (convResult) {
          if (convResult.error) throw convResult.error;

          if (!convResult.data) {
            setConversationExists(false);
            setLoading(false);
            setHeaderReady(true);
            // ── PASO 2 (conv no existe): marcar readStatus para no bloquear scroll
            setLastReadMessageId(lastReadId);
            setVisibleMessageId(visibleId);
            setReadStatusLoaded(true);
            setScrollDone(true);
            return;
          }

          const members = convResult.data.members || [];
          const otherMember = members.find((m: any) => m.user_id !== user.id);
          const other = Array.isArray(otherMember?.users)
            ? otherMember?.users[0]
            : otherMember?.users;

          const headerData = {
            title: convResult.data.is_group
              ? convResult.data.name || 'Group'
              : other?.fullname || other?.username || 'Usuario',
            avatar: convResult.data.is_group
              ? convResult.data.avatar_url || null
              : other?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
            isGroup: Boolean(convResult.data.is_group),
            otherUserId: convResult.data.is_group ? null : other?.id || null,
          };

          conversationCache.current.set(conversationId, headerData);

          if (mounted) {
            setConversationExists(true);
            setIsGroup(headerData.isGroup);
            setHeaderTitle(headerData.title);
            setHeaderAvatar(headerData.avatar);
            setOtherUserId(headerData.otherUserId);
            setHeaderReady(true);
          }

          // Verificar bloqueos en chat directo
          if (!headerData.isGroup && other?.id) {
            const [iBlocked, theyBlocked] = await Promise.all([
              UserBlockRepository.isBlocked(user.id, other.id),
              UserBlockRepository.isBlocked(other.id, user.id),
            ]);
            if (iBlocked || theyBlocked) {
              if (mounted) {
                setLoading(false);
                // PASO 2 (bloqueado): establecer readStatus para no bloquear overlay
                setLastReadMessageId(lastReadId);
                setVisibleMessageId(visibleId);
                setReadStatusLoaded(true);
                setScrollDone(true);
              }
              return;
            }
          }
        }

        // ── PASO 2: establecer estado de posición ANTES de cargar mensajes ───
        // Este es el cambio clave: readStatusLoaded=true ANTES de fetchMessages
        if (mounted) {
          setLastReadMessageId(lastReadId);
          setVisibleMessageId(visibleId);
          setReadStatusLoaded(true);
        }

        // ── PASO 3: cargar mensajes solo si no están en memoria ───────────────
        if (!hasGlobal) {
          await fetchMessages(conversationId);
          // fetchMessages actualiza messagesMap en el contexto, lo que dispara
          // el useEffect de scroll a través de la dependencia [messages]
        }
        // Si hasGlobal=true, los mensajes ya están y el useEffect de scroll
        // se disparará inmediatamente al ver readStatusLoaded=true

        if (mounted) setLoading(false);
      } catch (e) {
        if (mounted) {
          handleError(e, setToast, 'No se pudo cargar el chat');
          setLoading(false);
          // En caso de error, liberar el overlay para no bloquear al usuario
          setReadStatusLoaded(true);
          setScrollDone(true);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, user?.id]);

  // ── useEffect del scroll inicial ──────────────────────────────────────────
  // Dispara performInitialScroll cuando todas las condiciones están listas:
  //   - headerReady: header cargado
  //   - readStatusLoaded: posiciones cargadas (CAMBIO 1: ahora ocurre antes que fetchMessages)
  //   - messages.length > 0: mensajes disponibles
  useEffect(() => {
    if (initialScrollDone.current) return;
    if (!headerReady) return;
    if (!readStatusLoaded) return;
    if (!messagesMap[conversationId]) return; // Esperar a que lleguen al contexto

    if (!messages.length) {
      initialScrollDone.current = true;
      setScrollDone(true);
      return;
    }

    performInitialScroll();
  }, [
    headerReady,
    readStatusLoaded,
    messages,
    lastReadMessageId,
    visibleMessageId,
    performInitialScroll,
    conversationId,
    messagesMap,
  ]);

  // Si headerReady llega después de que el scroll ya terminó
  useEffect(() => {
    if (headerReady && initialScrollDone.current && !scrollDone) {
      setScrollDone(true);
    }
  }, [headerReady, scrollDone]);

  // ── Refresh del header al recuperar foco ─────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      // Marcar como leído cada vez que el usuario vuelve al chat
      if (initialScrollDone.current) {
        markConversationAsRead();
      }

      if (conversationCache.current.has(conversationId)) return;

      const refreshHeader = async () => {
        if (!user) return;
        try {
          const { data: conv, error } = await supabase
            .from('conversations')
            .select(
              `id, name, avatar_url, is_group,
               members:conversation_members (
                 user_id,
                 users (id, username, fullname, profile_pic_url)
               )`
            )
            .eq('id', conversationId)
            .maybeSingle();

          if (error || !conv) return;

          setConversationExists(true);
          setIsGroup(Boolean(conv.is_group));
          const otherUser = conv.members?.find(
            (m: any) => m.user_id !== user.id
          )?.users;
          const userData = Array.isArray(otherUser) ? otherUser[0] : otherUser;
          setHeaderTitle(
            conv.is_group
              ? conv.name || 'Group'
              : userData?.fullname || userData?.username || 'Usuario'
          );
          setHeaderAvatar(
            conv.is_group
              ? conv.avatar_url || null
              : userData?.profile_pic_url ||
                  'https://gravatar.com/avatar/?d=mp'
          );
          setOtherUserId(conv.is_group ? null : userData?.id || null);
        } catch (e) {
          handleError(e, setToast, 'Error refreshing conversation');
        }
      };

      refreshHeader();
    }, [conversationId, user?.id, markConversationAsRead])
  );

  // ── Scroll + marcar leído al recibir mensajes en tiempo real ─────────────
  useEffect(() => {
    if (messages.length === 0 || !initialScrollDone.current) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.isMine) return;

    if (isNearBottomRef.current) {
      // Usuario está al fondo: hacer scroll automático y marcar leído
      const timeoutId = setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
      markConversationAsRead();
      return () => clearTimeout(timeoutId);
    } else {
      // Usuario está scrolleado hacia arriba: marcar leído igualmente
      // porque el chat está abierto y activo
      markConversationAsRead();
    }
  }, [messages, markConversationAsRead]);

  // ── Marcar como leído al completar el scroll inicial ──────────────────────
  // scrollDone es estado React → dispara el efecto de forma fiable.
  // Al abrir el chat el usuario YA está viendo los mensajes, marcamos leído
  // sin necesidad de comprobar isNearBottomRef (que aún es false en este punto).
  useEffect(() => {
    if (!scrollDone || !headerReady || messages.length === 0) return;
    markConversationAsRead();
  }, [scrollDone, headerReady, messages, markConversationAsRead]);

  // ── Helpers de scroll ─────────────────────────────────────────────────────
  const checkScrollPosition = useCallback(
    (offsetY: number, contentH: number, layoutH: number) => {
      if (contentH <= layoutH) {
        setShowScrollButton(false);
        return;
      }
      const distanceFromBottom = contentH - offsetY - layoutH;
      setShowScrollButton(distanceFromBottom > 200);
    },
    []
  );

  // ── messageIndexMap para onViewableItemsChanged ───────────────────────────
  const messageIndexMap = React.useMemo(() => {
    const map = new Map<string, number>();
    messages.forEach((m, idx) => map.set(m.id, idx));
    return map;
  }, [messages]);

  // ── onViewableItemsChanged ────────────────────────────────────────────────
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ item: Message }> }) => {
      if (!initialScrollDone.current) return;
      if (viewableItems.length === 0) return;

      const topMost = [...viewableItems].sort((a, b) => {
        const aIdx = messageIndexMap.get(a.item.id) ?? -1;
        const bIdx = messageIndexMap.get(b.item.id) ?? -1;
        return aIdx - bIdx;
      })[0];

      const id = topMost.item.id;
      currentTopVisibleRef.current = id;
      setVisibleMessageId(id);

      if (user && id !== lastSavedVisibleRef.current) {
        lastSavedVisibleRef.current = id;
        if (visibleMessageTimeout.current)
          clearTimeout(visibleMessageTimeout.current);
        visibleMessageTimeout.current = setTimeout(() => {
          ConversationRepository.upsertVisibleMessage(
            conversationId,
            user.id,
            id
          ).catch(() => {});
        }, 500);
      }
    },
    [messageIndexMap, conversationId, user?.id]
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 500,
  }).current;

  // ── sendMessage ───────────────────────────────────────────────────────────
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

    const replyToId = replyingTo?.id || null;
    const imageToSend = selectedImage;
    setInput('');
    setSelectedImage(null);
    setReplyingTo(null);

    try {
      await MessageRepository.send({
        conversationId,
        senderId: user.id,
        content: text || null,
        imageUrl: imageToSend || null,
        replyToId,
      });
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    } catch (e) {
      handleError(e, setToast, 'No se pudo enviar el mensaje');
    }
  };

  // ── pickImage ─────────────────────────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      handleError(
        'Permiso denegado',
        setToast,
        'Se necesita permiso para acceder a la galería.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  // ── handleBlockFromChat ───────────────────────────────────────────────────
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

  // ── handleLeaveGroup ──────────────────────────────────────────────────────
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

  // ── scrollToMessage (para replies) ────────────────────────────────────────
  const scrollToMessage = useCallback(
    (replyToId: string) => {
      const index = messages.findIndex((msg) => msg.id === replyToId);
      if (index !== -1) {
        setHighlightedMessageId(replyToId);
        highlightBorderWidth.setValue(2);
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
        ]).start(() => setHighlightedMessageId(null));

        listRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }
    },
    [messages, highlightBorderWidth]
  );

  // ── renderMessage ─────────────────────────────────────────────────────────
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const previousMessageCreatedAt =
        index > 0 ? messages[index - 1]?.createdAt : undefined;
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
    },
    [
      messages,
      headerAvatar,
      isGroup,
      highlightedMessageId,
      highlightBorderWidth,
      colors,
      styles,
      scrollToMessage,
    ]
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  // ── CAMBIO 2: onLayout del FlatList ───────────────────────────────────────
  // Cuando el FlatList está listo físicamente, ejecutar cualquier scroll pendiente
  const handleFlatListLayout = useCallback(() => {
    if (flatListReady.current) return; // Ya estaba listo
    flatListReady.current = true;

    const pending = pendingScrollTarget.current;
    if (pending === null) return; // No hay scroll pendiente
    pendingScrollTarget.current = null;

    // CAMBIO 5: doble requestAnimationFrame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          if (pending.index >= 0) {
            listRef.current?.scrollToIndex({
              index: pending.index,
              animated: false,
              viewPosition: pending.viewPosition,
            });
          } else {
            listRef.current?.scrollToEnd({ animated: false });
          }
          initialScrollDone.current = true;
          setScrollDone(true);
        } catch {
          listRef.current?.scrollToEnd({ animated: false });
          initialScrollDone.current = true;
          setScrollDone(true);
        }
      });
    });
  }, []);

  // ── CAMBIO 4: onScrollToIndexFailed mejorado ──────────────────────────────
  // Hace scrollToEnd primero para forzar el render de items, luego reintenta
  const handleScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number; highestMeasuredFrameIndex: number }) => {
      // Ir al final primero para forzar que React Native renderice los items
      listRef.current?.scrollToEnd({ animated: false });

      setTimeout(() => {
        try {
          const safeIndex = Math.min(info.index, messages.length - 1);
          if (safeIndex >= 0) {
            listRef.current?.scrollToIndex({
              index: safeIndex,
              animated: false,
              viewPosition: 0.35,
            });
          }
        } catch {
          // Si sigue fallando, quedarse al final
        }

        if (!initialScrollDone.current) {
          initialScrollDone.current = true;
          setScrollDone(true);
        }
      }, 200);
    },
    [messages.length]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {isGroup && headerAvatar ? (
            <Image
              source={{ uri: headerAvatar }}
              style={styles.headerAvatar}
            />
          ) : isGroup ? (
            <View style={styles.headerGroupAvatar}>
              <Ionicons name="people" size={20} color={colors.secondaryBlue} />
            </View>
          ) : (
            <Image
              source={{
                uri: headerAvatar || 'https://gravatar.com/avatar/?d=mp',
              }}
              style={styles.headerAvatar}
            />
          )}
          <View>
            <Text style={styles.headerName}>{headerTitle}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => setOptionsVisible(true)}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* ── Messages + Input ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
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
            // CAMBIO 2: callback de layout para desbloquear scrolls pendientes
            onLayout={handleFlatListLayout}
            onScroll={(event) => {
              const { contentOffset, contentSize, layoutMeasurement } =
                event.nativeEvent;
              const distanceFromBottom =
                contentSize.height -
                contentOffset.y -
                layoutMeasurement.height;
              isNearBottomRef.current = distanceFromBottom < 150;
              checkScrollPosition(
                contentOffset.y ?? 0,
                contentSize.height ?? 0,
                layoutMeasurement.height ?? 0
              );
              // Cargar mensajes más viejos al llegar al tope
              if (
                contentOffset.y < 100 &&
                hasMoreMap[conversationId] &&
                !loadingMore.current
              ) {
                loadingMore.current = true;
                loadMoreMessages(conversationId).finally(() => {
                  loadingMore.current = false;
                });
              }
            }}
            onMomentumScrollEnd={(event) => {
              const { contentOffset, contentSize, layoutMeasurement } =
                event.nativeEvent;
              checkScrollPosition(
                contentOffset.y ?? 0,
                contentSize.height ?? 0,
                layoutMeasurement.height ?? 0
              );
              if (
                user &&
                currentTopVisibleRef.current &&
                currentTopVisibleRef.current !== lastSavedVisibleRef.current
              ) {
                lastSavedVisibleRef.current = currentTopVisibleRef.current;
                ConversationRepository.upsertVisibleMessage(
                  conversationId,
                  user.id,
                  currentTopVisibleRef.current
                ).catch(() => {});
              }
            }}
            onScrollEndDrag={(event) => {
              const { contentOffset, contentSize, layoutMeasurement } =
                event.nativeEvent;
              checkScrollPosition(
                contentOffset.y ?? 0,
                contentSize.height ?? 0,
                layoutMeasurement.height ?? 0
              );
            }}
            scrollEventThrottle={16}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={15}
            updateCellsBatchingPeriod={50}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            // CAMBIO 4: handler mejorado
            onScrollToIndexFailed={handleScrollToIndexFailed}
          />

          {/* Overlay de carga */}
          {overlayVisible && (
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: colors.canvasPure,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: overlayOpacity,
                },
              ]}
              pointerEvents="auto"
            >
              <Animated.View
                style={{
                  opacity: overlayPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }),
                  transform: [
                    {
                      scale: overlayPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.92, 1.08],
                      }),
                    },
                  ],
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: colors.primary,
                    opacity: 0.15,
                  }}
                />
              </Animated.View>
            </Animated.View>
          )}

          {/* Botón scroll-to-bottom */}
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
              transform: [
                {
                  scale: scrollButtonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                ...Shadows.active,
              }}
              onPress={() => {
                isNearBottomRef.current = true;
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
                  Respondiendo a{' '}
                  {replyingTo.senderName ||
                    (replyingTo.isMine ? 'ti mismo' : headerTitle)}
                </Text>
                {replyingTo.image && replyingTo.image.trim() !== '' ? (
                  <View style={styles.replyPreviewImageContainer}>
                    <Image
                      source={{ uri: replyingTo.image }}
                      style={styles.replyPreviewImage}
                    />
                  </View>
                ) : (
                  <Text style={styles.replyPreviewText} numberOfLines={1}>
                    {replyingTo.text}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          )}

          {selectedImage && (
            <View style={styles.selectedImagePreview}>
              {selectedImage.trim() !== '' && (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                />
              )}
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
              <Ionicons
                name="image-outline"
                size={24}
                color={colors.textSecondary}
              />
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
              style={[
                styles.sendBtn,
                !input.trim() && !selectedImage && styles.sendBtnDisabled,
              ]}
              onPress={sendMessage}
              disabled={!input.trim() && !selectedImage}
            >
              <Ionicons name="send" size={20} color={colors.canvasPure} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── Options modal ── */}
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
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setOptionsVisible(false)}
          />
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
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                  }}
                >
                  <Ionicons
                    name="pencil-outline"
                    size={22}
                    color={colors.textPrimary}
                  />
                  <Text
                    style={{
                      marginLeft: 10,
                      color: colors.textPrimary,
                      fontWeight: '700',
                    }}
                  >
                    Editar grupo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setOptionsVisible(false);
                    setShowLeaveModal(true);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                  }}
                >
                  <Ionicons name="exit-outline" size={22} color="#FF5252" />
                  <Text
                    style={{
                      marginLeft: 10,
                      color: '#FF5252',
                      fontWeight: '700',
                    }}
                  >
                    Salir del grupo
                  </Text>
                </TouchableOpacity>
              </>
            ) : !isGroup && otherUserId ? (
              <TouchableOpacity
                onPress={handleBlockFromChat}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                }}
              >
                <Ionicons name="ban-outline" size={22} color="#FF5252" />
                <Text
                  style={{
                    marginLeft: 10,
                    color: '#FF5252',
                    fontWeight: '700',
                  }}
                >
                  Bloquear usuario
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={() => setOptionsVisible(false)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
              }}
            >
              <Ionicons
                name="close-outline"
                size={22}
                color={colors.textPrimary}
              />
              <Text
                style={{
                  marginLeft: 10,
                  color: colors.textPrimary,
                  fontWeight: '700',
                }}
              >
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Leave Group modal ── */}
      <Modal
        visible={showLeaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.canvasPure,
              borderRadius: 16,
              padding: 20,
              width: '100%',
              maxWidth: 400,
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="exit-outline" size={48} color="#FF5252" />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.textPrimary,
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Salir del grupo
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                textAlign: 'center',
                marginBottom: 20,
                lineHeight: 22,
              }}
            >
              ¿Estás seguro de que quieres salir de este grupo? Ya no podrás
              ver ni enviar mensajes.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.componentBase,
                  alignItems: 'center',
                }}
                onPress={() => setShowLeaveModal(false)}
                disabled={leaving}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.textPrimary,
                  }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#FF5252',
                  alignItems: 'center',
                }}
                onPress={handleLeaveGroup}
                disabled={leaving}
              >
                {leaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: 'white',
                    }}
                  >
                    Salir
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Full screen image modal ── */}
      <Modal
        visible={fullScreenImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
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
                  resizeMode: 'contain',
                }}
              />
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}