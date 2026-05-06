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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import styles from '../styles/chatScreen.styles';

type ChatNavProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  text: string;
  time: string;
  isMine: boolean;
  image?: string;
}

// ── Mensajes de ejemplo ────────────────────────────────────────────────────────
const MOCK_MESSAGES: Message[] = [
  { id: '1', text: 'Hey! Did you manage to spot any cardinals this morning?', time: '9:12 AM', isMine: false },
  { id: '2', text: 'Yes! There was a beautiful male at the feeder around 7am 🐦', time: '9:14 AM', isMine: true },
  { id: '3', text: 'No way! I\'ve been trying to photograph one for weeks.', time: '9:15 AM', isMine: false },
  { id: '4', text: 'I\'ll share the coordinates of the spot, the feeder is right by the old oak.', time: '9:17 AM', isMine: true },
  {
    id: '5',
    text: 'Check this out — got a great shot!',
    image: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&q=80&w=400',
    time: '9:18 AM',
    isMine: true,
  },
  { id: '6', text: 'That\'s stunning!! The red is so vivid. What lens are you using?', time: '9:20 AM', isMine: false },
  { id: '7', text: 'Did you see the Cardinal at the feeder today?', time: '9:22 AM', isMine: false },
];

// ── Componente ────────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const navigation = useNavigation<ChatNavProp>();
  const route = useRoute<ChatRouteProp>();
  const { thread } = route.params;

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.isMine && styles.msgRowMine]}>
      {!item.isMine && (
        <Image source={{ uri: thread.avatar }} style={styles.msgAvatar} />
      )}
      <View style={[styles.bubble, item.isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.bubbleImage} />
        )}
        {item.text ? (
          <Text style={[styles.bubbleText, item.isMine && styles.bubbleTextMine]}>
            {item.text}
          </Text>
        ) : null}
        <Text style={[styles.bubbleTime, item.isMine && styles.bubbleTimeMine]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {thread.isGroup ? (
            <View style={styles.headerGroupAvatar}>
              <Ionicons name="people" size={20} color={Colors.secondaryBlue} />
            </View>
          ) : (
            <Image source={{ uri: thread.avatar }} style={styles.headerAvatar} />
          )}
          <View>
            <Text style={styles.headerName}>{thread.name}</Text>
            {thread.isOnline && (
              <Text style={styles.headerStatus}>● Online</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        {/* ── Input bar ── */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="image-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Message..."
              placeholderTextColor={Colors.placeholder}
              multiline
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
          </View>

          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={20} color={Colors.canvasPure} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
