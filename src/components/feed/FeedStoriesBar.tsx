import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../FeedItem';
import { Typography, Spacing, Radius } from '../../theme';
import { useT } from '../../i18n';

interface FeedStoriesBarProps {
  posts: Post[];
  onNewSightingPress: () => void;
  onUserPress: (userId: string) => void;
  colors: any;
}

export const FeedStoriesBar: React.FC<FeedStoriesBarProps> = React.memo(({
  posts,
  onNewSightingPress,
  onUserPress,
  colors,
}) => {
  const { t } = useT();

  // Extraer observadores únicos con foto
  const uniqueUsers = React.useMemo(() => {
    const map = new Map<string, { id: string; username: string; avatar: string }>();
    posts.forEach((p) => {
      if (p.userId && !map.has(p.userId)) {
        map.set(p.userId, {
          id: p.userId,
          username: p.username || 'user',
          avatar: p.userAvatar || 'https://gravatar.com/avatar/?d=mp',
        });
      }
    });
    return Array.from(map.values()).slice(0, 10);
  }, [posts]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Botón de Registrar Nuevo Avistamiento */}
        <TouchableOpacity
          style={styles.storyItem}
          activeOpacity={0.75}
          onPress={onNewSightingPress}
        >
          <View
            style={[
              styles.addRing,
              {
                borderColor: colors.primary,
                backgroundColor: colors.componentBase,
              },
            ]}
          >
            <View style={[styles.addIconCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </View>
          </View>
          <Text style={[styles.storyLabel, { color: colors.textPrimary }]} numberOfLines={1}>
            {t('feed.newSightingBtn')}
          </Text>
        </TouchableOpacity>

        {/* Historias / Observadores Activos */}
        {uniqueUsers.map((u) => (
          <TouchableOpacity
            key={u.id}
            style={styles.storyItem}
            activeOpacity={0.75}
            onPress={() => onUserPress(u.id)}
          >
            <View
              style={[
                styles.storyRing,
                {
                  borderColor: colors.primary,
                },
              ]}
            >
              <ExpoImage
                source={{ uri: u.avatar }}
                style={styles.avatar}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            </View>
            <Text style={[styles.storyLabel, { color: colors.textSecondary }]} numberOfLines={1}>
              {u.username}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: 12,
    alignItems: 'center',
  },
  storyItem: {
    alignItems: 'center',
    width: 62,
    gap: 4,
  },
  addRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  storyLabel: {
    fontSize: 10.5,
    fontFamily: Typography.fontFamilyBody,
    fontWeight: '600',
    textAlign: 'center',
  },
});
