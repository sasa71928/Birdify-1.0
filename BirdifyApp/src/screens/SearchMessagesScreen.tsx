import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { Colors, Typography, Spacing, Radius } from '../theme';
import { RootStackParamList, ChatThread } from '../navigation/AppNavigator';
import styles from '../styles/searchMessagesScreen.styles';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'SearchMessages'>;

// ── Datos compartidos ─────────────────────────────────────────────────────────
const ALL_THREADS: ChatThread[] = [
  {
    id: '1', name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
    lastMessage: 'Did you see the Cardinal at the feeder today?', time: '2m', unreadCount: 2, isOnline: true,
  },
  {
    id: '2', name: 'Mike Thompson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
    lastMessage: 'Thanks for sharing the coordinates, headed there now.', time: '1h',
  },
  {
    id: '3', name: 'Local Birders Group',
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=100',
    lastMessage: 'Elena: Found a great spot for warblers near the old mill.', time: 'Yesterday', isGroup: true,
  },
  {
    id: '4', name: 'Anna K.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100',
    lastMessage: 'Yes, the lighting was perfect for those shots.', time: 'Tue',
  },
];

export default function SearchMessagesScreen() {
  const navigation = useNavigation<NavProp>();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');

  const results = query.trim()
    ? ALL_THREADS.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.lastMessage.toLowerCase().includes(query.toLowerCase()),
      )
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

  const renderItem = ({ item }: { item: ChatThread }) => (
    <TouchableOpacity
      style={styles.resultRow}
      activeOpacity={0.75}
      onPress={() => navigation.navigate('Chat', { thread: item })}
    >
      <View style={styles.avatarWrap}>
        {item.isGroup ? (
          <View style={styles.groupAvatar}>
            <Ionicons name="people" size={22} color={Colors.secondaryBlue} />
          </View>
        ) : (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
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
      <StatusBar barStyle="dark-content" />

      {/* ── Search bar ── */}
      <View style={styles.searchBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
          <TextInput
            ref={inputRef}
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search conversations..."
            placeholderTextColor={Colors.placeholder}
            style={styles.input}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.outlineGrey} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Resultados ── */}
      {query.trim().length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={52} color={Colors.outlineGrey} />
          <Text style={styles.emptyTitle}>Search conversations</Text>
          <Text style={styles.emptySubtitle}>Find messages by contact name or keywords</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={Colors.outlineGrey} />
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

// ── Estilos ───────────────────────────────────────────────────────────────────
