import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { createStyles } from '../../styles/screens/bird/birdDetailScreen.styles';

import FeedItem, { Post } from '../../components/FeedItem';
import { SightingRepository } from '../../repositories/sighting.repository';
import { useAuth } from '../../context/AuthContext';

type BirdDetailNavProp =
  NativeStackNavigationProp<RootStackParamList, 'BirdDetail'>;

type BirdDetailRouteProp =
  RouteProp<RootStackParamList, 'BirdDetail'>;

function mapSightingToPost(sighting: any, currentUserId?: string): Post {
  const timeDiff = Date.now() - new Date(sighting.created_at).getTime();
  const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));

  const timeAgoStr =
    hoursAgo < 24
      ? hoursAgo === 0
        ? 'Hace un momento'
        : `Hace ${hoursAgo} hora${hoursAgo === 1 ? '' : 's'}`
      : `Hace ${Math.floor(hoursAgo / 24)} día${Math.floor(hoursAgo / 24) === 1 ? '' : 's'}`;

  const reactionsList = sighting.reactions || [];
  const likesCount = reactionsList.length;

  const hasLiked = currentUserId
    ? reactionsList.some((r: any) => r.user_id === currentUserId)
    : false;

  const userData = Array.isArray(sighting.user)
    ? sighting.user[0]
    : sighting.user;

  return {
    id: sighting.id,
    userId: sighting.user_id,
    username: userData?.username || 'Usuario',
    userAvatar: userData?.profile_pic_url || 'https://gravatar.com/avatar/?d=mp',
    location: sighting.is_location_private
      ? 'Ubicación Privada'
      : 'En la Naturaleza',
    image:
      sighting.photo_url ||
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600',
    tag: sighting.bird?.common_name || 'Ave',
    likes: likesCount,
    comments: sighting.comments?.length || 0,
    caption: sighting.description || '',
    timeAgo: timeAgoStr,
    isVerified: userData?.is_verified === true,
    commentsList: [],
    hasLiked,
  };
}

export default function BirdDetailScreen() {
  const navigation = useNavigation<BirdDetailNavProp>();
  const route = useRoute<BirdDetailRouteProp>();

  const bird = route.params?.bird;

  const { user } = useAuth();
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const classification = bird?.classification;

  useEffect(() => {
    if (bird?.id) loadBirdSightings();
  }, [bird?.id]);

  const loadBirdSightings = async () => {
    try {
      setLoading(true);

      const sightings = await SightingRepository.getFeed();

      const filtered = sightings.filter(
        (item: any) => item.bird_id === bird?.id
      );

      const mapped = filtered.map((item: any) =>
        mapSightingToPost(item, user?.id)
      );

      setPosts(mapped);
    } catch (error) {
      console.error('Error loading sightings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!bird) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ color: colors.textSecondary }}>
          No bird data found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* HERO */}
        <View style={styles.hero}>
          <Image
            source={{
              uri: bird?.image ?? 'https://images.unsplash.com/photo-1444464666168-49d633b867ad',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.heroOverlay} />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <Text style={styles.heroName}>{bird.name}</Text>
            <Text style={styles.heroScientific}>
              {bird.scientificName}
            </Text>
          </View>
        </View>

        {/* CLASSIFICATION */}
        {classification && (
          <View style={styles.card}>
            <View style={styles.sectionRow}>
              <MaterialCommunityIcons
                name="dna"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.cardTitle}>
                Scientific Classification
              </Text>
            </View>

            <View style={styles.classGrid}>
              {[
                { label: 'KINGDOM', value: classification.kingdom },
                { label: 'PHYLUM', value: classification.phylum },
                { label: 'CLASS', value: classification.class },
                { label: 'ORDER', value: classification.order },
                { label: 'FAMILY', value: classification.family },
                { label: 'GENUS', value: classification.genus },
              ].map(({ label, value }) => (
                <View key={label} style={styles.classCell}>
                  <Text style={styles.classCellLabel}>{label}</Text>
                  <Text style={styles.classCellValue}>
                    {value || 'Unknown'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* OVERVIEW */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overviewText}>
            {bird.overview || 'No overview available.'}
          </Text>

          {/* Habitat */}
          <View style={styles.infoBlock}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="tree" size={18} color={colors.canvasPure} />
            </View>

            <View style={styles.infoBlockText}>
              <Text style={styles.infoBlockTitle}>Habitat</Text>
              <Text style={styles.infoBlockBody}>
                {bird.habitat || 'Unknown'}
              </Text>
            </View>
          </View>

          {/* Conservation */}
          <View style={styles.infoBlock}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.secondaryBlue }]}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={18}
                color={colors.canvasPure}
              />
            </View>

            <View style={styles.infoBlockText}>
              <Text style={styles.infoBlockTitle}>
                Conservation Status
              </Text>
              <Text style={styles.infoBlockBody}>
                {bird.conservationStatus || 'Unknown'}
              </Text>
            </View>
          </View>
        </View>

        {/* SIGHTINGS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Avistamientos Recientes
          </Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : posts.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>
              No hay avistamientos para esta especie.
            </Text>
          ) : (
            posts.map((post) => (
              <FeedItem key={post.id} post={post} />
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}