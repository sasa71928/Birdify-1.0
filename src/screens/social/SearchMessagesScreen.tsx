import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { RootStackParamList, ChatThread } from '../../navigation/AppNavigator';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { useUnreadMessages } from '../../context/UnreadMessagesContext';
import { Avatar } from '../../components/ui/Avatar';
import { Radius, Typography, Spacing } from '../../theme';
import { useT } from '../../i18n';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'SearchMessages'>;

function normalizeText(text?: string | null): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function SearchMessagesScreen() {
  const navigation = useNavigation<NavProp>();
  const { colors, isDark } = useDynamicStyles();
  const { conversations, conversationsLoading } = useUnreadMessages();
  const { t } = useT();
  const inputRef = useRef<any>(null);
  const [query, setQuery] = useState('');

  const normalizedQuery = normalizeText(query.trim());

  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    return conversations.filter((thread) => {
      const nameNorm = normalizeText(thread.name);
      const msgNorm = normalizeText(thread.lastMessage);
      return nameNorm.includes(normalizedQuery) || msgNorm.includes(normalizedQuery);
    });
  }, [conversations, normalizedQuery]);

  const highlightMatch = (text: string, q: string) => {
    if (!q.trim() || !text) return text;
    const normText = normalizeText(text);
    const normQ = normalizeText(q);
    const idx = normText.indexOf(normQ);
    if (idx === -1) return text;

    const before = text.slice(0, idx);
    const matched = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);

    return (
      <Text>
        {before}
        <Text style={{ backgroundColor: colors.primary + '30', fontWeight: '700' }}>
          {matched}
        </Text>
        {after}
      </Text>
    );
  };

  const renderItem = ({ item }: { item: ChatThread }) => {
    return (
      <TouchableOpacity
        style={[
          styles.resultRow,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border + '15',
          },
        ]}
        activeOpacity={0.75}
        onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
      >
        <Avatar
          uri={item.avatar}
          name={item.name}
          size={46}
          isGroup={item.isGroup}
        />

        <View style={styles.info}>
          <Text
            style={[
              styles.name,
              { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
            ]}
            numberOfLines={1}
          >
            {highlightMatch(item.name, query)}
          </Text>

          <Text
            style={[
              styles.lastMessage,
              { color: colors.textSecondary, fontFamily: Typography.fontFamilyBody },
            ]}
            numberOfLines={1}
          >
            {highlightMatch(item.lastMessage, query)}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary + '80'} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Barra de búsqueda */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border + '20',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.componentBase,
              borderColor: colors.border + '30',
            },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            ref={inputRef}
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder={t('search.placeholder')}
            placeholderTextColor={colors.placeholder}
            style={[styles.input, { color: colors.textPrimary }]}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Resultados */}
      {conversationsLoading ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {t('common.loading')}
          </Text>
        </View>
      ) : query.trim().length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={56} color={colors.textSecondary + '80'} />
          <Text
            style={[
              styles.emptyTitle,
              { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
            ]}
          >
            {t('search.title')}
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: colors.textSecondary, fontFamily: Typography.fontFamilyBody },
            ]}
          >
            {t('search.subtitle')}
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.textSecondary + '80'} />
          <Text
            style={[
              styles.emptyTitle,
              { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
            ]}
          >
            {t('search.noResultsTitle')}
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: colors.textSecondary, fontFamily: Typography.fontFamilyBody },
            ]}
          >
            {t('search.noResultsDesc', { query })}
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.resultsCount,
              { color: colors.textSecondary, fontFamily: Typography.fontFamilyBody },
            ]}
          >
            {results.length === 1
              ? t('search.resultsCount', { count: 1, query })
              : t('search.resultsCountPlural', { count: results.length, query })}
          </Text>

          <FlashList
            data={results}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: {
    padding: 6,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    padding: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  resultsCount: {
    fontSize: 12.5,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 24,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  lastMessage: {
    fontSize: 13,
  },
});
