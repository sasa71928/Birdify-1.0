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
  const listRef = useRef<FlatList>(null);

  const mapRawMessage = useCallback(
    (m: any): Message => ({
      id: m.id,
      text: m.content ?? '',
      image: m.image_url ?? undefined,
      time: new Date(m.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isMine: m.sender_id === user?.id,
      senderName: m.profiles?.username ?? undefined,
      senderAvatar: m.profiles?.avatar_url ?? undefined,
      replyToId: m.reply_to_id ?? undefined,
    }),
    [user?.id]
  );

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      try {
        const raw = await getMessages(thread.id);
        setMessages(raw.map(mapRawMessage));
        setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
      } catch (e) {
        console.error('Error cargando mensajes:', e);
      } finally {
        setLoading(false);
      }
    };

    init();

    const sub = subscribeToMessages(thread.id, (newMsg: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: newMsg.id,
          text: newMsg.content ?? '',
          image: newMsg.image_url ?? undefined,
          time: new Date(newMsg.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isMine: newMsg.sender_id === user.id,
        },
      ]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => { supabase.removeChannel(sub); };
  }, [thread.id, user, mapRawMessage]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !user || sending) return;
    setSending(true);
    setInput('');
    const replyId = replyingTo?.id;
    setReplyingTo(null);
    try {
      await sendMessage(thread.id, user.id, text, replyId);
    } catch (e) {
      console.error('Error enviando mensaje:', e);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const pickImage = async () => {
    if (!user) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { alert('Se necesita permiso para acceder a la galería.'); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        await sendImageMessage(thread.id, user.id, result.assets[0].uri);
        setReplyingTo(null);
      } catch (e) {
        alert('No se pudo enviar la imagen.');
      }
    }
  };

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
          <SwipeableMessage isMine={item.isMine} onSwipe={() => setReplyingTo(item)}>
            <TouchableOpacity
              onLongPress={() => setReplyingTo(item)}
              activeOpacity={0.9}
              style={[styles.bubble, item.isMine ? styles.bubbleMine : styles.bubbleTheirs]}
            >
              {item.replyToId && (
                <View style={[styles.replyQuote, item.isMine ? styles.replyQuoteMine : styles.replyQuoteTheirs]}>
                  <Text style={styles.replyQuoteUser}>{item.replyToUser}</Text>
                  <Text style={styles.replyQuoteText} numberOfLines={1}>{item.replyToText}</Text>
                </View>
              )}
              {item.image && <Image source={{ uri: item.image }} style={styles.bubbleImage} />}
              {item.text ? (
                <Text style={[styles.bubbleText, item.isMine && styles.bubbleTextMine]}>
                  {item.text}
                </Text>
              ) : null}
              <Text style={[styles.bubbleTime, item.isMine && styles.bubbleTimeMine]}>
                {item.time}
              </Text>
            </TouchableOpacity>
          </SwipeableMessage>
        </View>
      </View>
    </View>
  );

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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
                  Respondiendo a {replyingTo.senderName || (replyingTo.isMine ? 'ti mismo' : thread.name)}
                </Text>
                <Text style={styles.replyPreviewText} numberOfLines={1}>{replyingTo.text}</Text>
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
    </SafeAreaView>
  );
}