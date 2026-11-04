import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { useT } from '../../../i18n';
import { PressableScale } from '../../../components/animated';
import { Radius, Typography, Shadows, Spacing } from '../../../theme';

interface LogbookViewProps {
  species: any[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STAMP_WIDTH = (SCREEN_WIDTH - 40 - 12) / 2;

export const LogbookView: React.FC<LogbookViewProps> = ({ species }) => {
  const { colors, isDark } = useDynamicStyles();
  const { t } = useT();

  const [selectedSpecies, setSelectedSpecies] = useState<any>(null);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showFullImageModal, setShowFullImageModal] = useState(false);

  const totalSpecies = species.length;
  const totalSightings = species.reduce((sum, e) => sum + (e.count || 1), 0);

  const handleSpeciesPress = (entry: any) => {
    setSelectedSpecies(entry);
    setShowImagesModal(true);
  };

  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowFullImageModal(true);
  };

  if (species.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View
          style={[
            styles.emptyIconCircle,
            { backgroundColor: colors.primary + '12' },
          ]}
        >
          <MaterialCommunityIcons name="bird" size={38} color={colors.primary} />
        </View>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t('profile.noSpecies')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Bar */}
      <View
        style={[
          styles.summaryBar,
          {
            backgroundColor: colors.canvasPure,
            borderColor: isDark ? colors.border + '30' : colors.border + '20',
          },
        ]}
      >
        <View style={styles.statBox}>
          <MaterialCommunityIcons name="bird" size={22} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
            {totalSpecies}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t('profile.totalSpecies')}
          </Text>
        </View>

        <View
          style={[
            styles.statDivider,
            { backgroundColor: colors.border + '20' },
          ]}
        />

        <View style={styles.statBox}>
          <Ionicons name="eye-outline" size={22} color={colors.secondaryBlue} />
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
            {totalSightings}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t('profile.totalSightings')}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {t('profile.birdStamps')}
      </Text>

      {/* Stamps Grid */}
      <View style={styles.stampsGrid}>
        {species.map((entry) => (
          <PressableScale
            key={entry.id}
            activeScale={0.95}
            haptic="light"
            onPress={() => handleSpeciesPress(entry)}
            style={[
              styles.stampCard,
              {
                backgroundColor: colors.canvasPure,
                borderColor: isDark ? colors.border + '30' : colors.border + '20',
              },
            ]}
          >
            {/* Stamp Image Box with perforation simulation */}
            <View
              style={[
                styles.stampImageBox,
                { backgroundColor: colors.primary + '10' },
              ]}
            >
              <MaterialCommunityIcons
                name="bird"
                size={46}
                color={colors.primary}
              />
            </View>

            <Text
              numberOfLines={1}
              style={[styles.stampName, { color: colors.textPrimary }]}
            >
              {entry.name}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.stampScientific, { color: colors.textSecondary }]}
            >
              {entry.scientificName}
            </Text>

            <View style={styles.countBadge}>
              <Ionicons
                name="eye-outline"
                size={11}
                color={colors.textSecondary}
              />
              <Text style={[styles.countText, { color: colors.textSecondary }]}>
                ×{entry.count}
              </Text>
            </View>
          </PressableScale>
        ))}
      </View>

      {/* Species Images Modal */}
      <Modal
        visible={showImagesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImagesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, { color: colors.textPrimary }]}
              >
                {selectedSpecies?.name}
              </Text>
              <PressableScale
                activeScale={0.9}
                onPress={() => setShowImagesModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </PressableScale>
            </View>

            <ScrollView
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {!selectedSpecies?.images || selectedSpecies.images.length === 0 ? (
                <View style={{ padding: 30, alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary }}>
                    {t('profile.noImagesAvailable')}
                  </Text>
                </View>
              ) : (
                (() => {
                  const groupedByDate = selectedSpecies.images.reduce(
                    (acc: any, img: any) => {
                      if (!acc[img.date]) acc[img.date] = [];
                      acc[img.date].push(img);
                      return acc;
                    },
                    {}
                  );

                  return Object.entries(groupedByDate).map(
                    ([date, images]: [string, any]) => (
                      <View key={date} style={{ marginBottom: 16 }}>
                        <Text
                          style={[
                            styles.dateHeader,
                            { color: colors.textPrimary },
                          ]}
                        >
                          {date}
                        </Text>
                        <View style={styles.imagesGrid}>
                          {images.map((img: any, idx: number) => (
                            <PressableScale
                              key={`${img.sightingId}-${idx}`}
                              activeScale={0.94}
                              onPress={() => handleImagePress(img.url)}
                              style={styles.imageItemWrap}
                            >
                              <Image
                                source={{ uri: img.url }}
                                style={styles.imageItem}
                              />
                            </PressableScale>
                          ))}
                        </View>
                      </View>
                    )
                  );
                })()
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Full-size Image Viewer */}
      <Modal
        visible={showFullImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFullImageModal(false)}
      >
        <PressableScale
          style={styles.fullImageOverlay}
          activeScale={1}
          onPress={() => setShowFullImageModal(false)}
        >
          <Image
            source={{ uri: selectedImage || '' }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </PressableScale>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyBody,
    textAlign: 'center',
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: 20,
    ...Shadows.card,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '800',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Typography.fontFamilyBody,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 4,
  },
  stampsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stampCard: {
    width: STAMP_WIDTH,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    ...Shadows.card,
  },
  stampImageBox: {
    width: '100%',
    height: 90,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  stampName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
    width: '100%',
    textAlign: 'center',
  },
  stampScientific: {
    fontSize: 11,
    fontFamily: Typography.fontFamilyBody,
    fontStyle: 'italic',
    width: '100%',
    textAlign: 'center',
    marginTop: 1,
    marginBottom: 6,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontSize: 11,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modalTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
  },
  dateHeader: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilyDisplay,
    fontWeight: '700',
    marginBottom: 8,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageItemWrap: {
    width: (SCREEN_WIDTH - 80) / 3,
    height: (SCREEN_WIDTH - 80) / 3,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  imageItem: {
    width: '100%',
    height: '100%',
  },
  fullImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});

