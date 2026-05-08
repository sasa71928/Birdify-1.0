import React from 'react';
import { FlatList, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme';
import FeedItem, { Post } from '../../components/FeedItem';
import TopNavBar from '../../components/TopNavBar';
import shared from '../../styles/shared/shared.styles';
import styles from '../../styles/screens/main/feedScreen.styles';

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    username: 'ElenaRios',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    location: 'Malecón, La Paz',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600', // A fox-like animal for variety
    tag: 'Cardenal Rojo',
    likes: 245,
    comments: 12,
    caption: 'Spotted this beauty right by the water this morning. The contrast against the early morning light was incredible! 🌊✨',
    timeAgo: '2 hours ago',
    isVerified: true,
  },
  {
    id: '2',
    username: 'NatureWatcher99',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    location: 'Central Park, NY',
    image: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=600', // A blue jay or similar bird
    tag: 'Blue Jay',
    likes: 89,
    comments: 4,
    caption: 'Very vocal this morning! Managed to snap this before it flew off to the upper canopy.',
    timeAgo: '5 hours ago',
  },
];

export default function FeedScreen() {
  return (
    <SafeAreaView style={shared.safe}>
      <StatusBar barStyle="dark-content" />
      <TopNavBar />
      
      <FlatList
        data={MOCK_POSTS}
        renderItem={({ item }) => <FeedItem post={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

