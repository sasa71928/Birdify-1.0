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
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600',
    tag: 'Cardenal Rojo',
    likes: 245,
    comments: 12,
    caption: 'Spotted this beauty right by the water this morning. The contrast against the early morning light was incredible! It was a truly magical moment that reminds me why I love bird watching so much. The vibrant red of the cardinal stood out so sharply against the soft blues and oranges of the sunrise.',
    timeAgo: '2 hours ago',
    isVerified: true,
    commentsList: [
      { id: 'c1', username: 'BirdLover', text: '¡Qué foto tan increíble!' },
      { 
        id: 'c2', 
        username: 'NatureCam', 
        text: '¿Qué lente usaste?',
        replies: [
          { id: 'r1', username: 'ElenaRios', text: 'Un 70-200mm f/2.8' },
          { id: 'r2', username: 'NatureCam', text: '¡Excelente elección!' }
        ]
      },
      { id: 'c3', username: 'AlexW', text: 'Yo vi uno parecido ayer en el parque.' },
      { id: 'c4', username: 'Sofia_G', text: 'Los colores son espectaculares.' },
      { id: 'c5', username: 'CarlosM', text: '¡Buena captura!' },
      { id: 'c6', username: 'Maria_V', text: 'Me encanta la iluminación.' },
    ]
  },
  {
    id: '2',
    username: 'NatureWatcher99',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    location: 'Central Park, NY',
    image: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=600',
    tag: 'Blue Jay',
    likes: 89,
    comments: 4,
    caption: 'Very vocal this morning! Managed to snap this before it flew off to the upper canopy.',
    timeAgo: '5 hours ago',
    commentsList: [
      { id: 'c7', username: 'ParksDept', text: 'Nice shot of our resident Blue Jay!' },
      { id: 'c8', username: 'EarlyBird', text: 'I saw him too! He was very loud near the lake.' },
    ]
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
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
}

