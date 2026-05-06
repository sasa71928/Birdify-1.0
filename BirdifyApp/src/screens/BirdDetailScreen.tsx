import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { RootStackParamList, BirdSpeciesData } from '../navigation/AppNavigator';
import styles from '../styles/birdDetailScreen.styles';

type BirdDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'BirdDetail'>;
type BirdDetailRouteProp = RouteProp<RootStackParamList, 'BirdDetail'>;

// ── Avistamientos de ejemplo ──────────────────────────────────────────────────
const MOCK_SIGHTINGS = [
  {
    id: '1',
    user: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    timeAgo: '2 hours ago',
    location: 'La Paz, BCS',
    image: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&q=80&w=600',
    likes: 24,
    comments: 3,
  },
  {
    id: '2',
    user: 'Mario Santos',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    timeAgo: 'Yesterday',
    location: 'Ensenada',
    image: 'https://images.unsplash.com/photo-1470114716159-e389f8ae4b57?auto=format&fit=crop&q=80&w=600',
    likes: 12,
    comments: 1,
  },
];

// ── Componente ────────────────────────────────────────────────────────────────
export default function BirdDetailScreen() {
  const navigation = useNavigation<BirdDetailNavProp>();
  const route = useRoute<BirdDetailRouteProp>();
  const { bird } = route.params;

  const classification = bird.classification;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Hero con imagen ── */}
        <View style={styles.hero}>
          <Image source={{ uri: bird.image }} style={styles.heroImage} />
          {/* Overlay gradient */}
          <View style={styles.heroOverlay} />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.canvasPure} />
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
              <MaterialCommunityIcons name="dna" size={18} color={Colors.primary} />
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
            <View style={[styles.infoIconCircle, { backgroundColor: Colors.primary }]}>
              <MaterialCommunityIcons name="tree" size={18} color={Colors.canvasPure} />
            </View>
            <View style={styles.infoBlockText}>
              <Text style={styles.infoBlockTitle}>Habitat</Text>
              <Text style={styles.infoBlockBody}>{bird.habitat}</Text>
            </View>
          </View>

          {/* Conservation */}
          <View style={styles.infoBlock}>
            <View style={[styles.infoIconCircle, { backgroundColor: Colors.secondaryBlue }]}>
              <MaterialCommunityIcons name="shield-check-outline" size={18} color={Colors.canvasPure} />
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
            <TouchableOpacity>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          {MOCK_SIGHTINGS.map((s) => (
            <View key={s.id} style={styles.sightingCard}>
              {/* Author row */}
              <View style={styles.sightingAuthorRow}>
                <Image source={{ uri: s.avatar }} style={styles.sightingAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sightingUser}>{s.user}</Text>
                  <Text style={styles.sightingMeta}>{s.timeAgo} • {s.location}</Text>
                </View>
              </View>
              {/* Photo */}
              <Image source={{ uri: s.image }} style={styles.sightingImage} />
              {/* Actions */}
              <View style={styles.sightingActions}>
                <View style={styles.sightingActionGroup}>
                  <TouchableOpacity style={styles.sightingAction}>
                    <Ionicons name="heart-outline" size={22} color={Colors.textPrimary} />
                    <Text style={styles.sightingActionText}>{s.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sightingAction}>
                    <MaterialCommunityIcons name="comment-outline" size={22} color={Colors.textPrimary} />
                    <Text style={styles.sightingActionText}>{s.comments}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity>
                  <Ionicons name="share-outline" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
