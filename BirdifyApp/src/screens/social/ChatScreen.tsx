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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import styles from '../../styles/screens/social/chatScreen.styles';

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
  isRead?: boolean;
}

// ── Mensajes de ejemplo ────────────────────────────────────────────────────────
const MOCK_MESSAGES: Message[] = [
  { id: '1', text: 'Hey! Did you manage to spot any cardinals this morning?', time: '9:12 AM', isMine: false, senderName: 'Elena Rios', senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100', isRead: true },
  { id: '2', text: 'Yes! There was a beautiful male at the feeder around 7am 🐦', time: '9:14 AM', isMine: true, isRead: true },
  { id: '3', text: 'No way! I\'ve been trying to photograph one for weeks.', time: '9:15 AM', isMine: false, senderName: 'Alex W.', senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100', isRead: true },
  { id: '4', text: 'I\'ll share the coordinates of the spot, the feeder is right by the old oak.', time: '9:17 AM', isMine: true, isRead: true },
  {
    id: '5',
    text: 'Check this out — got a great shot!',
    image: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&q=80&w=400',
    time: '9:18 AM',
    isMine: true,
    isRead: true,
  },
  { id: '6', text: 'That\'s stunning!! The red is so vivid. What lens are you using?', time: '9:20 AM', isMine: false, senderName: 'Sofia G.', senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', isRead: false },
  { id: '7', text: 'Did you see the Cardinal at the feeder today?', time: '9:22 AM', isMine: false, senderName: 'Elena Rios', senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100', isRead: false },
];

// ── Componente ────────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const navigation = useNavigation<ChatNavProp>();
  const route = useRoute<ChatRouteProp>();
  const { thread } = route.params;

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const listRef = useRef<FlatList>(null);

  React.useEffect(() => {
    const hasUnread = messages.some(m => !m.isMine && !m.isRead);
    
    if (hasUnread) {
      // Animated scroll to the first unread
      const firstUnreadIndex = messages.findIndex(m => !m.isMine && !m.isRead);
      if (firstUnreadIndex !== -1) {
        setTimeout(() => {
          listRef.current?.scrollToIndex({ 
            index: firstUnreadIndex, 
            animated: true,
            viewPosition: 0
          });
        }, 500);
      }
    } else {
      // Immediate scroll to bottom if everything is read
      // No timeout or animation for a "direct" appearance
      listRef.current?.scrollToEnd({ animated: false });
    }
  }, []);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      replyToId: replyingTo?.id,
      replyToText: replyingTo?.text,
      replyToUser: replyingTo?.senderName || (replyingTo?.isMine ? 'Tú' : thread.name),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setReplyingTo(null);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
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
      const imageUri = result.assets[0].uri;
      const newMsg: Message = {
        id: Date.now().toString(),
        text: '',
        image: imageUri,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMine: true,
        replyToId: replyingTo?.id,
        replyToText: replyingTo?.text,
        replyToUser: replyingTo?.senderName || (replyingTo?.isMine ? 'Tú' : thread.name),
      };
      setMessages((prev) => [...prev, newMsg]);
      setReplyingTo(null);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
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

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.isMine && styles.msgRowMine]}>
      {!item.isMine && thread.isGroup && (
        <View style={styles.senderContainer}>
          <Image source={{ uri: item.senderAvatar || thread.avatar }} style={styles.msgAvatarTop} />
          <Text style={styles.senderName}>{item.senderName}</Text>
        </View>
      )}
      
      <View style={[styles.bubbleWrapper, item.isMine && styles.bubbleWrapperMine]}>
        {!item.isMine && !thread.isGroup && (
          <Image source={{ uri: thread.avatar }} style={styles.msgAvatar} />
        )}
        
        <View style={[styles.bubbleFlexContainer, item.isMine && styles.bubbleFlexContainerMine]}>
          <SwipeableMessage isMine={item.isMine} onSwipe={() => setReplyingTo(item)}>
            <TouchableOpacity 
              onLongPress={() => setReplyingTo(item)}
              activeOpacity={0.9}
              style={[
                styles.bubble, 
                item.isMine ? styles.bubbleMine : styles.bubbleTheirs,
                thread.isGroup && !item.isMine && styles.bubbleGroup
              ]}
            >
              {item.replyToId && (
                <View style={[styles.replyQuote, item.isMine ? styles.replyQuoteMine : styles.replyQuoteTheirs]}>
                  <Text style={styles.replyQuoteUser}>{item.replyToUser}</Text>
                  <Text style={styles.replyQuoteText} numberOfLines={1}>{item.replyToText}</Text>
                </View>
              )}

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
            </TouchableOpacity>
          </SwipeableMessage>
        </View>
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
          onScrollToIndexFailed={(info) => {
            // Fallback if scrollToIndex fails (e.g. items not rendered yet)
            listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
          }}
        />

        {/* ── Input bar ── */}
        <View style={styles.inputContainer}>
          {replyingTo && (
            <View style={styles.replyPreviewBar}>
              <View style={styles.replyPreviewLine} />
              <View style={styles.replyPreviewContent}>
                <Text style={styles.replyPreviewUser}>
                  Respondiendo a {replyingTo.senderName || (replyingTo.isMine ? 'ti mismo' : thread.name)}
                </Text>
                <Text style={styles.replyPreviewText} numberOfLines={1}>
                  {replyingTo.text}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

