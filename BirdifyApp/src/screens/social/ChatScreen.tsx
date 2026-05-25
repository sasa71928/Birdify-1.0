import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  Animated,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/social/chatScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import {
  getMessages,
  sendMessage,
  sendImageMessage,
  subscribeToMessages,
  deleteMessageForEveryone,
  deleteMessageForMe,
} from '../../services/chat.service';
import { supabase } from '../../lib/supabase';

type ChatNavProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  text: string;
  time: string;
  isMine: boolean;
  image?: string;
  isDeleted?: boolean;
  senderName?: string;
  senderAvatar?: string;
  replyToId?: string;
  replyToText?: string;
  replyToUser?: string;
}

export default function ChatScreen() {
  const navigation = useNavigation<ChatNavProp>();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const route = useRoute<ChatRouteProp>();
  const { thread } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [showMsgMenu, setShowMsgMenu] = useState(false);
  const listRef = useRef<FlatList>(null);

  // ── Mapear mensaje raw → Message ──────────────────────────────────────────
  const mapRawMessage = useCallback(
    (m: any, allMessages?: any[]): Message | null => {
      // Filtrar mensajes borrados solo para mí
      const deletedFor: string[] = m.deleted_for ?? [];
      if (user?.id && deletedFor.includes(user.id)) return null;

      let replyToText: string | undefined;
      let replyToUser: string | undefined;

      if (m.reply_to_id && allMessages) {
        const parent = allMessages.find((msg: any) => msg.id === m.reply_to_id);
        if (parent) {
          replyToText = parent.is_deleted
            ? 'Este mensaje fue eliminado'
            : parent.content ?? (parent.image_url ? '📷 Imagen' : '');
          replyToUser = parent.profiles?.username ?? 'Usuario';
        }
      }

      return {
        id: m.id,
        text: m.is_deleted ? 'Este mensaje fue eliminado' : (m.content ?? ''),
        image: m.is_deleted ? undefined : (m.image_url ?? undefined),
        isDeleted: m.is_deleted ?? false,
        time: new Date(m.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isMine: m.sender_id === user?.id,
        senderName: m.profiles?.username ?? undefined,
        senderAvatar: m.profiles?.avatar_url ?? undefined,
        replyToId: m.reply_to_id ?? undefined,
        replyToText,
        replyToUser,
      };
    },
    [user?.id]
  );

  // ── Cargar mensajes + suscripción realtime ────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const init = async () => {
      try {
        const raw = await getMessages(thread.id);
        const mapped = raw
          .map((m: any) => mapRawMessage(m, raw))
          .filter(Boolean) as Message[];
        setMessages(mapped);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
      } catch (e) {
        console.error('Error cargando mensajes:', e);
      } finally {
        setLoading(false);
      }
    };

    init();

    const sub = subscribeToMessages(thread.id, async (newMsg: any) => {
      // Ignorar mensajes propios — ya agregados optimistamente
      if (newMsg.sender_id === user.id) return;

      // Resolver reply del mensaje entrante si tiene
      let replyToText: string | undefined;
      let replyToUser: string | undefined;
      if (newMsg.reply_to_id) {
        try {
          const { data: parent } = await supabase
            .from('messages')
            .select('content, image_url, is_deleted, profiles(username)')
            .eq('id', newMsg.reply_to_id)
            .single();
          if (parent) {
            replyToText = (parent as any).is_deleted
              ? 'Este mensaje fue eliminado'
              : (parent as any).content ?? ((parent as any).image_url ? '📷 Imagen' : '');
            replyToUser = (parent as any).profiles?.username ?? 'Usuario';
          }
        } catch (_) {}
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [
          ...prev,
          {
            id: newMsg.id,
            text: newMsg.is_deleted ? 'Este mensaje fue eliminado' : (newMsg.content ?? ''),
            image: newMsg.is_deleted ? undefined : (newMsg.image_url ?? undefined),
            isDeleted: newMsg.is_deleted ?? false,
            time: new Date(newMsg.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            isMine: false,
            replyToId: newMsg.reply_to_id ?? undefined,
            replyToText,
            replyToUser,
          },
        ];
      });
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => { supabase.removeChannel(sub); };
  }, [thread.id, user, mapRawMessage]);

  // ── Enviar mensaje de texto (optimista) ───────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !user || sending) return;
    setSending(true);
    setInput('');

    const replyId = replyingTo?.id;
    const replyText = replyingTo?.text;
    const replyUser = replyingTo?.senderName ?? (replyingTo?.isMine ? 'Tú' : thread.name);
    setReplyingTo(null);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      replyToId: replyId,
      replyToText: replyText,
      replyToUser: replyUser,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const saved = await sendMessage(thread.id, user.id, text, replyId);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, id: saved.id } : m))
      );
    } catch (e) {
      console.error('Error enviando mensaje:', e);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  // ── Enviar imagen (optimista) ─────────────────────────────────────────────
  const pickImage = async () => {
    if (!user) return;
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
      const tempId = `temp-img-${Date.now()}`;
      const optimisticImg: Message = {
        id: tempId,
        text: '',
        image: result.assets[0].uri,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMine: true,
      };
      setMessages((prev) => [...prev, optimisticImg]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
      setReplyingTo(null);

      try {
        const saved = await sendImageMessage(thread.id, user.id, result.assets[0].uri);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, id: saved.id, image: saved.image_url } : m
          )
        );
      } catch (e) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        alert('No se pudo enviar la imagen.');
      }
    }
  };

  // ── Borrar mensaje ────────────────────────────────────────────────────────
  const handleLongPressMessage = (item: Message) => {
    if (item.isDeleted) return;
    setSelectedMsg(item);
    setShowMsgMenu(true);
  };

  const confirmDeleteForMe = async () => {
    if (!selectedMsg || !user) return;
    setShowMsgMenu(false);
    try {
      await deleteMessageForMe(selectedMsg.id, user.id);
      setMessages((prev) => prev.filter((m) => m.id !== selectedMsg.id));
    } catch (e) {
      Alert.alert('Error', 'No se pudo borrar el mensaje.');
    }
    setSelectedMsg(null);
  };

  const confirmDeleteForEveryone = async () => {
    if (!selectedMsg || !user) return;
    setShowMsgMenu(false);
    try {
      await deleteMessageForEveryone(selectedMsg.id, user.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMsg.id
            ? { ...m, text: 'Este mensaje fue eliminado', image: undefined, isDeleted: true }
            : m
        )
      );
    } catch (e: any) {
      Alert.alert(
        'No disponible',
        e.message ?? 'Solo puedes borrar mensajes enviados en la última hora.'
      );
    }
    setSelectedMsg(null);
  };

  // ── SwipeableMessage ──────────────────────────────────────────────────────
  const SwipeableMessage = ({
    children, onSwipe, isMine,
  }: { children: React.ReactNode; onSwipe: () => void; isMine: boolean }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && g.dx > 0 && !isMine,
        onPanResponderMove: (_, g) => { if (g.dx > 0 && g.dx < 80) translateX.setValue(g.dx); },
        onPanResponderRelease: (_, g) => {
          if (g.dx > 50) onSwipe();
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        },
      })
    ).current;

    return (
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    );
  };

  // ── Render de cada mensaje ────────────────────────────────────────────────
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.isMine && styles.msgRowMine]}>
      {!item.isMine && thread.isGroup && (
        <View style={styles.senderContainer}>
          {item.senderAvatar ? (
            <Image source={{ uri: item.senderAvatar }} style={styles.msgAvatarTop} />
          ) : (
            <View style={[styles.msgAvatarTop, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="person" size={14} color={colors.textSecondary} />
            </View>
          )}
          <Text style={styles.senderName}>{item.senderName}</Text>
        </View>
      )}

      <View style={[styles.bubbleWrapper, item.isMine && styles.bubbleWrapperMine]}>
        {!item.isMine && !thread.isGroup && (
          thread.avatar ? (
            <Image source={{ uri: thread.avatar }} style={styles.msgAvatar} />
          ) : (
            <View style={[styles.msgAvatar, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="person" size={14} color={colors.textSecondary} />
            </View>
          )
        )}

        <View style={[styles.bubbleFlexContainer, item.isMine && styles.bubbleFlexContainerMine]}>
          {/* Swipe para responder — desactivado en mensajes eliminados */}
          <SwipeableMessage
            isMine={item.isMine}
            onSwipe={() => !item.isDeleted && setReplyingTo(item)}
          >
            <TouchableOpacity
              onLongPress={() => handleLongPressMessage(item)}
              activeOpacity={0.9}
              style={[styles.bubble, item.isMine ? styles.bubbleMine : styles.bubbleTheirs]}
            >
              {/* Quote de respuesta */}
              {item.replyToId && !item.isDeleted && (
                <View style={[styles.replyQuote, item.isMine ? styles.replyQuoteMine : styles.replyQuoteTheirs]}>
                  <Text style={styles.replyQuoteUser}>{item.replyToUser}</Text>
                  <Text style={styles.replyQuoteText} numberOfLines={1}>{item.replyToText}</Text>
                </View>
              )}

              {/* Contenido del mensaje */}
              {item.isDeleted ? (
                <Text style={[
                  styles.bubbleText,
                  item.isMine && styles.bubbleTextMine,
                  { fontStyle: 'italic', opacity: 0.55 },
                ]}>
                  🚫 Este mensaje fue eliminado
                </Text>
              ) : (
                <>
                  {item.image && (
                    <Image source={{ uri: item.image }} style={styles.bubbleImage} />
                  )}
                  {item.text ? (
                    <Text style={[styles.bubbleText, item.isMine && styles.bubbleTextMine]}>
                      {item.text}
                    </Text>
                  ) : null}
                </>
              )}

              <Text style={[styles.bubbleTime, item.isMine && styles.bubbleTimeMine]}>
                {item.time}
              </Text>
            </TouchableOpacity>
          </SwipeableMessage>
        </View>
      </View>
    </View>
  );

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {thread.isGroup ? (
            <View style={styles.headerGroupAvatar}>
              <Ionicons name="people" size={20} color={colors.secondaryBlue} />
            </View>
          ) : thread.avatar ? (
            <Image source={{ uri: thread.avatar }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="person" size={18} color={colors.textSecondary} />
            </View>
          )}
          <View>
            <Text style={styles.headerName}>{thread.name}</Text>
            {thread.isOnline && <Text style={styles.headerStatus}>● Online</Text>}
          </View>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Mensajes ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* ── Input ── */}
        <View style={styles.inputContainer}>
          {replyingTo && (
            <View style={styles.replyPreviewBar}>
              <View style={styles.replyPreviewLine} />
              <View style={styles.replyPreviewContent}>
                <Text style={styles.replyPreviewUser}>
                  Respondiendo a {replyingTo.senderName ?? (replyingTo.isMine ? 'ti mismo' : thread.name)}
                </Text>
                <Text style={styles.replyPreviewText} numberOfLines={1}>
                  {replyingTo.text}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
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
                onSubmitEditing={handleSend}
              />
            </View>
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.canvasPure} />
              ) : (
                <Ionicons name="send" size={20} color={colors.canvasPure} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── Modal menú borrar mensaje ── */}
      <Modal
        visible={showMsgMenu}
        transparent
        animationType="fade"
        onRequestClose={() => { setShowMsgMenu(false); setSelectedMsg(null); }}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => { setShowMsgMenu(false); setSelectedMsg(null); }}
        >
          <View style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 36,
          }}>
            {/* Handle */}
            <View style={{
              width: 36, height: 4, borderRadius: 2,
              backgroundColor: colors.textSecondary,
              alignSelf: 'center', opacity: 0.3, marginBottom: 16,
            }} />

            <Text style={{
              color: colors.textSecondary, fontSize: 12,
              textAlign: 'center', marginBottom: 8, letterSpacing: 0.5,
            }}>
              {selectedMsg?.isMine ? 'Tu mensaje' : 'Mensaje'}
            </Text>

            {/* Responder */}
            {!selectedMsg?.isDeleted && (
              <TouchableOpacity
                onPress={() => {
                  setShowMsgMenu(false);
                  if (selectedMsg) setReplyingTo(selectedMsg);
                  setSelectedMsg(null);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 }}
              >
                <Ionicons name="arrow-undo-outline" size={22} color={colors.textPrimary} />
                <Text style={{ color: colors.textPrimary, fontSize: 16 }}>Responder</Text>
              </TouchableOpacity>
            )}

            {/* Borrar para mí — siempre disponible */}
            <TouchableOpacity
              onPress={confirmDeleteForMe}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 }}
            >
              <Ionicons name="trash-outline" size={22} color={colors.textPrimary} />
              <View>
                <Text style={{ color: colors.textPrimary, fontSize: 16 }}>Borrar para mí</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Solo tú dejarás de ver este mensaje
                </Text>
              </View>
            </TouchableOpacity>

            {/* Borrar para todos — solo si es tuyo y no está ya eliminado */}
            {selectedMsg?.isMine && !selectedMsg?.isDeleted && (
              <TouchableOpacity
                onPress={confirmDeleteForEveryone}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 }}
              >
                <Ionicons name="trash" size={22} color="#e53e3e" />
                <View>
                  <Text style={{ color: '#e53e3e', fontSize: 16 }}>Borrar para todos</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    Solo disponible durante 1 hora
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Cancelar */}
            <TouchableOpacity
              onPress={() => { setShowMsgMenu(false); setSelectedMsg(null); }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14, marginTop: 4 }}
            >
              <Ionicons name="close-outline" size={22} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}