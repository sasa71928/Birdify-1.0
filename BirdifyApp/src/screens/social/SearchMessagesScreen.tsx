import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { ConversationRepository } from '../../repositories/conversation.repository';
import { useAuth } from '../../context/AuthContext';
import { createStyles } from '../../styles/screens/social/searchMessagesScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'SearchMessages'>;



export default function SearchMessagesScreen() {
  const navigation = useNavigation<NavProp>();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { user } = useAuth();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const items = await ConversationRepository.listForUser(user.id);
      setConversations(items);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const results = query.trim()
    ? conversations.filter((item) => {
        const c = item.conversation;
        const members = c.members || [];
        const other = members.find((m: any) => m.user_id !== user?.id)?.users;
        const name = c.is_group ? (c.name || 'Group') : (other?.fullname || other?.username || 'Usuario');
        const lastMessage = item.lastMessage?.content || (item.lastMessage?.image_url ? '📷 Foto' : '');
        return (
          name.toLowerCase().includes(query.toLowerCase()) ||
          lastMessage.toLowerCase().includes(query.toLowerCase())
        );
      })
    : [];

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return <Text>{text}</Text>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <Text>{text}</Text>;
    return (
      <Text>
        {text.slice(0, idx)}
        <Text style={styles.highlight}>{text.slice(idx, idx + query.length)}</Text>
        {text.slice(idx + query.length)}
      </Text>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const c = item.conversation;
    const members = c.members || [];
    const other = members.find((m: any) => m.user_id !== user?.id)?.users;
    const name = c.is_group ? (c.name || 'Group') : (other?.fullname || other?.username || 'Usuario');
    const avatar = c.is_group
      ? (c.avatar_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=100')
      : (other?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp');
    const lastMessage = item.lastMessage?.content || (item.lastMessage?.image_url ? '📷 Foto' : '');

    return (
      <TouchableOpacity
        style={styles.resultRow}
        activeOpacity={0.75}
        onPress={() => navigation.navigate('Chat', { conversationId: c.id })}
      >
        <View style={styles.avatarWrap}>
          {c.is_group ? (
            <View style={styles.groupAvatar}>
              <Ionicons name="people" size={22} color={colors.secondaryBlue} />
            </View>
          ) : (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.infoRow}>
            <Text style={styles.name}>{highlightMatch(name, query)}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {highlightMatch(lastMessage, query)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── Search bar ── */}
      <View style={styles.searchBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            ref={inputRef}
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search conversations..."
            placeholderTextColor={colors.placeholder}
            style={styles.input}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.outlineGrey} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Resultados ── */}
      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Loading...</Text>
        </View>
      ) : query.trim().length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={52} color={colors.outlineGrey} />
          <Text style={styles.emptyTitle}>Search conversations</Text>
          <Text style={styles.emptySubtitle}>Find messages by contact name or keywords</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.outlineGrey} />
          <Text style={styles.emptyTitle}>No results</Text>
          <Text style={styles.emptySubtitle}>No conversations match "{query}"</Text>
        </View>
      ) : (
        <>
          <Text style={styles.resultsCount}>
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </Text>
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={(item) => item.conversation.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </>
      )}
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

