import React from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { createStyles } from '../../styles/screens/bird/birdDetailScreen.styles';

import FeedItem from '../../components/FeedItem';
import { useBirdDetail } from '../../hooks/useBirdDetail';
import AppToast from '../../components/AppToast';

export default function BirdDetailScreen() {
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const {
    bird,
    posts,
    loading,
    classification,
    toast,
    setToast,
    handlePostDeleted,
    goBack,
  } = useBirdDetail();

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
      <AppToast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />

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
            onPress={goBack}
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
              <FeedItem key={post.id} post={post} onPostDeleted={handlePostDeleted} />
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}