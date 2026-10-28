import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SkeletonBone } from './SkeletonBone';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ExploreSkeleton: React.FC = () => {
  const { colors, isDark } = useDynamicStyles();
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';

  return (
    <View style={styles.container}>
      {/* Fondo de mapa con pulso */}
      <SkeletonBone
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        borderRadius={0}
        style={styles.mapBackground}
      />

      {/* Floating Search Bar */}
      <View style={styles.floatingTop}>
        <SkeletonBone width="100%" height={48} borderRadius={24} style={styles.searchBar} />
        
        {/* Floating Filter Chips */}
        <View style={styles.chipsRow}>
          <SkeletonBone width={85} height={32} borderRadius={16} style={{ marginRight: 8 }} />
          <SkeletonBone width={110} height={32} borderRadius={16} style={{ marginRight: 8 }} />
          <SkeletonBone width={95} height={32} borderRadius={16} />
        </View>
      </View>

      {/* Floating Card at bottom */}
      <View style={[styles.floatingBottom, { backgroundColor: cardBg }]}>
        <View style={styles.bottomCardRow}>
          <SkeletonBone width={56} height={56} borderRadius={12} />
          <View style={styles.bottomCardInfo}>
            <SkeletonBone width={140} height={16} borderRadius={6} style={{ marginBottom: 6 }} />
            <SkeletonBone width={90} height={12} borderRadius={4} />
          </View>
          <SkeletonBone width={36} height={36} borderRadius={18} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  mapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingTop: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
  },
  floatingBottom: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    padding: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  bottomCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
});
