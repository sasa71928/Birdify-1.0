import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, Image, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, ChatThread } from '../../navigation/AppNavigator';
import { createStyles } from '../../styles/screens/social/searchMessagesScreen.styles';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useAuth } from '../../context/AuthContext';
import { getThreads } from '../../services/chat.service';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'SearchMessages'>;

export default function SearchMessagesScreen() {
  const navigation = useNavigation<NavProp>();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { user } = useAuth();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery]       = useState('');
  const [allThreads, setAllThreads] = useState<ChatThread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);

  // Cargar hilos reales de Supabase cada vez que la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setLoadingThreads(true);
      getThreads(user.id)
        .then((raw) => {
          const mapped: ChatThread[] = raw
            .map((item: any) => {
              const conv = item.conversations;
              if (!conv) return null;
              const msgs: any[] = Array.isArray(conv.messages) ? conv.messages : [];
              const last = msgs.sort(
                (a: any, b: any) =>
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )[0];
              return {
                id: conv.id,
                name: conv.name ?? 'Chat',
                avatar: conv.avatar_url ?? '',
                isGroup: conv.is_group ?? false,
                lastMessage: last?.content ?? '',
                time: last
                  ? new Date(last.created_at).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit',
                    })
                  : '',
              } as ChatThread;
            })
            .filter(Boolean) as ChatThread[];
          setAllThreads(mapped);
        })
        .catch((e) => console.error('Error cargando hilos en búsqueda:', e))
        .finally(() => setLoadingThreads(false));
    }, [user])
  );

  const results = query.trim()
    ? allThreads.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.lastMessage.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return <Text>{text}</Text>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <Text>{text}</Text>;
    return (
      <Text>
        {text.slice(0, idx)}
        <Text style={styles.highlight}>{text.slice(idx, idx + q.length)}</Text>
        {text.slice(idx + q.length)}
      </Text>
    );
  };

  const renderItem = ({ item }: { item: ChatThread }) => (
    <TouchableOpacity
      style={styles.resultRow}
      activeOpacity={0.75}
      onPress={() => navigation.navigate('Chat', { thread: item })}
    >
      <View style={styles.avatarWrap}>
        {item.isGroup ? (
          <View style={styles.groupAvatar}>
            <Ionicons name="people" size={22} color={colors.secondaryBlue} />
          </View>
        ) : item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.groupAvatar, { backgroundColor: colors.surface }]}>
            <Ionicons name="person" size={20} color={colors.textSecondary} />
          </View>
        )}
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Text style={styles.name}>{highlightMatch(item.name, query)}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {highlightMatch(item.lastMessage, query)}
        </Text>
      </View>
    </TouchableOpacity>
  );

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

      {/* ── Contenido ── */}
      {loadingThreads ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
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
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </>
      )}
    </SafeAreaView>
  );
}