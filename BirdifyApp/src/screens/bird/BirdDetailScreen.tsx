import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
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

type BirdDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'BirdDetail'>;
type BirdDetailRouteProp = RouteProp<RootStackParamList, 'BirdDetail'>;

function mapSightingToPost(sighting: any, currentUserId?: string): Post {
  const timeDiff = Date.now() - new Date(sighting.created_at).getTime();
  const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));

  const timeAgoStr =
    hoursAgo < 24
      ? hoursAgo === 0
        ? 'Hace un momento'
        : `Hace ${hoursAgo} hora${hoursAgo === 1 ? '' : 's'}`
      : `Hace ${Math.floor(hoursAgo / 24)} día${
          Math.floor(hoursAgo / 24) === 1 ? '' : 's'
        }`;

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
    userAvatar:
      userData?.profile_pic_url ||
      'https://gravatar.com/avatar/?d=mp',
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



// ── Componente ────────────────────────────────────────────────────────────────
export default function BirdDetailScreen() {
  const navigation = useNavigation<BirdDetailNavProp>();
  const route = useRoute<BirdDetailRouteProp>();
  const { bird } = route.params;

  const classification = bird.classification;

  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);

  useEffect(() => {
  loadBirdSightings();
  }, []);

  const loadBirdSightings = async () => {
    try {
      setIsLoading(true);

      const sightings = await SightingRepository.getFeed();

      // FILTRAR SOLO ESTA AVE
      const filtered = sightings.filter(
        (item: any) =>
          item.bird_id === bird.id
      );

      const mapped = filtered.map((item: any) =>
        mapSightingToPost(item, user?.id)
      );

      setPosts(mapped);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Hero con imagen ── */}
        <View style={styles.hero}>
          <Image source={{ uri: bird.image }} style={styles.heroImage} />
          {/* Overlay gradient */}
          <View style={styles.heroOverlay} />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>

          {/* Bird name over image */}
          <View style={styles.heroContent}>
            <Text style={styles.heroName}>{bird.name}</Text>
            <Text style={styles.heroScientific}>{bird.scientificName}</Text>
          </View>
        </View>

        {/* ── Clasificación científica ── */}
        {classification && (
          <View style={styles.card}>
            <View style={styles.sectionRow}>
              <MaterialCommunityIcons name="dna" size={18} color={colors.primary} />
              <Text style={styles.cardTitle}> Scientific Classification</Text>
            </View>
            <View style={styles.classGrid}>
              {[
                { label: 'KINGDOM', value: classification.kingdom },
                { label: 'PHYLUM',  value: classification.phylum },
                { label: 'CLASS',   value: classification.class },
                { label: 'ORDER',   value: classification.order },
                { label: 'FAMILY',  value: classification.family },
                { label: 'GENUS',   value: classification.genus },
              ].map(({ label, value }) => (
                <View key={label} style={styles.classCell}>
                  <Text style={styles.classCellLabel}>{label}</Text>
                  <Text style={styles.classCellValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Overview ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overviewText}>{bird.overview}</Text>

          {/* Habitat */}
          <View style={styles.infoBlock}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="tree" size={18} color={colors.canvasPure} />
            </View>
            <View style={styles.infoBlockText}>
              <Text style={styles.infoBlockTitle}>Habitat</Text>
              <Text style={styles.infoBlockBody}>{bird.habitat}</Text>
            </View>
          </View>

          {/* Conservation */}
          <View style={styles.infoBlock}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.secondaryBlue }]}>
              <MaterialCommunityIcons name="shield-check-outline" size={18} color={colors.canvasPure} />
            </View>
            <View style={styles.infoBlockText}>
              <Text style={styles.infoBlockTitle}>Conservation Status</Text>
              <Text style={styles.infoBlockBody}>{bird.conservationStatus}</Text>
            </View>
          </View>
        </View>

        {/* ── Avistamientos recientes ── */}
        <View style={styles.section}>
          <View style={styles.sightingsHeader}>
            <Text style={styles.sectionTitle}>Avistamientos Recientes</Text>
          </View>

            {posts.length === 0 ? (
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

// ── Estilos ───────────────────────────────────────────────────────────────────

