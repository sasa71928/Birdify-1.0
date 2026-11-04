import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { createStyles } from '../../styles/screens/bird/birdDetailScreen.styles';
import FeedItem from '../../components/FeedItem';
import { SkeletonBone } from '../../components/skeleton';
import { useBirdDetail } from '../../hooks/useBirdDetail';
import { useT } from '../../i18n';
import AppToast from '../../components/AppToast';
import { PressableScale } from '../../components/animated/PressableScale';

export default function BirdDetailScreen() {
  const { screen: styles, colors, isDark } = useDynamicStyles(createStyles);
  const { t } = useT();
  const {
    bird,
    posts,
    loading,
    classification,
    toast,
    setToast,
    handlePostDeleted,
    handleLikeToggled,
    handleCommentAdded,
    goBack,
    handleRecordSighting,
    handleExploreMap,
  } = useBirdDetail();

  if (!bird) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>
            No se encontró información del ave.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isMigratory = bird.status === 'MIGRATORIA';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO SECTION */}
        <View style={styles.hero}>
          <ExpoImage
            source={{
              uri:
                bird.image ||
                'https://images.unsplash.com/photo-1444464666168-49d633b867ad',
            }}
            style={styles.heroImage}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />

          <View style={styles.heroOverlay}>
            <View style={styles.heroTopRow}>
              <PressableScale
                activeScale={0.92}
                haptic="light"
                style={styles.backBtn}
                onPress={goBack}
                accessibilityRole="button"
                accessibilityLabel={t('common.back')}
              >
                <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
              </PressableScale>

              <View
                style={[
                  styles.statusBadge,
                  isMigratory
                    ? styles.statusBadgeMigratory
                    : styles.statusBadgeResident,
                ]}
              >
                <Ionicons
                  name={isMigratory ? 'airplane' : 'home'}
                  size={12}
                  color="#FFFFFF"
                />
                <Text style={styles.statusBadgeText}>
                  {isMigratory ? t('bird.statusMigratory') : t('bird.statusResident')}
                </Text>
              </View>
            </View>

            <View style={styles.heroBottomContent}>
              <Text style={styles.heroName}>{bird.name}</Text>
              <Text style={styles.heroScientific}>{bird.scientificName}</Text>
            </View>
          </View>
        </View>

        {/* QUICK ACTIONS BAR */}
        <View style={styles.actionsRow}>
          <PressableScale
            activeScale={0.96}
            haptic="medium"
            style={styles.actionBtnPrimary}
            onPress={handleRecordSighting}
            accessibilityRole="button"
          >
            <Ionicons name="camera" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnPrimaryText}>
              {t('dictionary.recordSightingOfBird')}
            </Text>
          </PressableScale>

          <PressableScale
            activeScale={0.96}
            haptic="light"
            style={styles.actionBtnSecondary}
            onPress={handleExploreMap}
            accessibilityRole="button"
          >
            <Ionicons name="map-outline" size={17} color={colors.primary} />
            <Text style={styles.actionBtnSecondaryText}>
              {t('dictionary.exploreOnMap')}
            </Text>
          </PressableScale>
        </View>

        {/* TAXONOMY CLASSIFICATION */}
        {classification && (
          <View style={styles.card}>
            <View style={styles.sectionRow}>
              <MaterialCommunityIcons
                name="dna"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.cardTitle}>{t('bird.classification')}</Text>
            </View>

            <View style={styles.classGrid}>
              {[
                {
                  label: t('bird.kingdom'),
                  value: classification.kingdom,
                },
                {
                  label: t('bird.phylum'),
                  value: classification.phylum,
                },
                {
                  label: t('bird.class'),
                  value: classification.class,
                },
                {
                  label: t('bird.order'),
                  value: classification.order,
                },
                {
                  label: t('bird.family'),
                  value: classification.family,
                },
                {
                  label: t('bird.genus'),
                  value: classification.genus,
                },
              ].map(({ label, value }) => (
                <View key={label} style={styles.classCell}>
                  <Text style={styles.classCellLabel}>{label}</Text>
                  <Text style={styles.classCellValue} numberOfLines={1}>
                    {value || '—'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* OVERVIEW & ECOLOGY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('bird.overview')}</Text>
          <Text style={styles.overviewText}>
            {bird.overview || 'Sin descripción disponible.'}
          </Text>

          {/* Habitat */}
          <View style={styles.infoBlock}>
            <View
              style={[
                styles.infoIconCircle,
                { backgroundColor: colors.primary + '18' },
              ]}
            >
              <MaterialCommunityIcons
                name="tree"
                size={20}
                color={colors.primary}
              />
            </View>

            <View style={styles.infoBlockText}>
              <Text style={styles.infoBlockTitle}>{t('bird.habitat')}</Text>
              <Text style={styles.infoBlockBody}>
                {bird.habitat || 'Sin información de hábitat'}
              </Text>
            </View>
          </View>

          {/* Conservation */}
          <View style={styles.infoBlock}>
            <View
              style={[
                styles.infoIconCircle,
                { backgroundColor: colors.secondaryBlue + '18' },
              ]}
            >
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={20}
                color={colors.secondaryBlue}
              />
            </View>

            <View style={styles.infoBlockText}>
              <Text style={styles.infoBlockTitle}>
                {t('bird.conservation')}
              </Text>
              <Text style={styles.infoBlockBody}>
                {bird.conservationStatus || 'Preocupación Menor'}
              </Text>
            </View>
          </View>
        </View>

        {/* RECENT SIGHTINGS */}
        <View style={styles.section}>
          <View style={styles.sightingsHeaderRow}>
            <Text style={styles.sectionTitle}>{t('bird.recentSightings')}</Text>
            {!loading && posts.length > 0 && (
              <View style={styles.sightingsCountBadge}>
                <Text style={styles.sightingsCountText}>
                  {posts.length}
                </Text>
              </View>
            )}
          </View>

          {loading ? (
            <View style={{ gap: 12 }}>
              <SkeletonBone width="100%" height={140} borderRadius={16} />
              <SkeletonBone width="100%" height={140} borderRadius={16} />
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.emptySightingsCard}>
              <MaterialCommunityIcons
                name="binoculars"
                size={36}
                color={colors.primary}
              />
              <Text style={styles.emptySightingsTitle}>
                {t('dictionary.noSightingsYet')}
              </Text>
              <Text style={styles.emptySightingsSubtitle}>
                {t('dictionary.beFirstToSpot')}
              </Text>
              <TouchableOpacity
                style={styles.emptyRecordBtn}
                activeOpacity={0.8}
                onPress={handleRecordSighting}
              >
                <Ionicons name="camera" size={14} color="#FFFFFF" />
                <Text style={styles.emptyRecordBtnText}>
                  {t('dictionary.recordSightingOfBird')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            posts.map((post) => (
              <FeedItem
                key={post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onLikeToggled={handleLikeToggled}
                onCommentAdded={handleCommentAdded}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
