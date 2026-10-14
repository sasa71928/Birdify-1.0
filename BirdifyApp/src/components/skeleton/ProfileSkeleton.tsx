import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SkeletonBone } from './SkeletonBone';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_ITEM_SIZE = (SCREEN_WIDTH - 36) / 3;

export const ProfileSkeleton: React.FC = () => {
  const { isDark } = useDynamicStyles();
  const dividerColor = isDark ? '#2D322D' : '#E8EDE7';

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Avatar centrado */}
      <View style={styles.avatarSection}>
        <SkeletonBone width={88} height={88} borderRadius={44} style={{ marginBottom: 12 }} />
        <SkeletonBone width={160} height={18} borderRadius={6} style={{ marginBottom: 6 }} />
        <SkeletonBone width={90} height={13} borderRadius={5} style={{ marginBottom: 16 }} />
      </View>

      {/* Fila de estadísticas */}
      <View style={[styles.statsRow, { borderColor: dividerColor }]}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.statItem}>
            <SkeletonBone width={30} height={18} borderRadius={5} style={{ marginBottom: 4 }} />
            <SkeletonBone width={50} height={11} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Botón de acción */}
      <View style={styles.actionRow}>
        <SkeletonBone width="100%" height={40} borderRadius={20} />
      </View>

      {/* Líneas de biografía */}
      <View style={styles.bioSection}>
        <SkeletonBone width="90%" height={12} borderRadius={4} style={{ marginBottom: 6 }} />
        <SkeletonBone width="60%" height={12} borderRadius={4} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { borderColor: dividerColor }]}>
        <SkeletonBone width={70} height={14} borderRadius={6} />
        <SkeletonBone width={70} height={14} borderRadius={6} />
        <SkeletonBone width={70} height={14} borderRadius={6} />
      </View>

      {/* Grid de publicaciones / avistamientos */}
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
          <SkeletonBone
            key={item}
            width={GRID_ITEM_SIZE}
            height={GRID_ITEM_SIZE}
            borderRadius={8}
            style={styles.gridItem}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  actionRow: {
    paddingHorizontal: 20,
    marginTop: 14,
  },
  bioSection: {
    paddingHorizontal: 20,
    marginTop: 14,
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    marginTop: 16,
    borderBottomWidth: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 6,
  },
  gridItem: {
    marginBottom: 2,
  },
});
