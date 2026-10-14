import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonBone } from './SkeletonBone';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

export const FeedSkeleton: React.FC = () => {
  const { colors, isDark } = useDynamicStyles();
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#2D322D' : '#EDF2EC';

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {[1, 2, 3].map((item) => (
        <View
          key={item}
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor },
          ]}
        >
          {/* Header del post: Avatar + Usuario */}
          <View style={styles.headerRow}>
            <SkeletonBone width={44} height={44} borderRadius={22} />
            <View style={styles.headerInfo}>
              <SkeletonBone width={130} height={14} borderRadius={6} style={{ marginBottom: 6 }} />
              <SkeletonBone width={85} height={11} borderRadius={5} />
            </View>
            <SkeletonBone width={24} height={14} borderRadius={4} />
          </View>

          {/* Especie y descripción */}
          <View style={styles.textBlock}>
            <SkeletonBone width={180} height={16} borderRadius={6} style={{ marginBottom: 8 }} />
            <SkeletonBone width="95%" height={12} borderRadius={5} style={{ marginBottom: 6 }} />
            <SkeletonBone width="70%" height={12} borderRadius={5} />
          </View>

          {/* Imagen principal del avistamiento */}
          <SkeletonBone width="100%" height={260} borderRadius={14} style={{ marginVertical: 12 }} />

          {/* Barra de reacciones / comentarios */}
          <View style={styles.actionsRow}>
            <View style={styles.actionGroup}>
              <SkeletonBone width={32} height={32} borderRadius={16} style={{ marginRight: 6 }} />
              <SkeletonBone width={35} height={12} borderRadius={5} />
            </View>
            <View style={styles.actionGroup}>
              <SkeletonBone width={32} height={32} borderRadius={16} style={{ marginRight: 6 }} />
              <SkeletonBone width={35} height={12} borderRadius={5} />
            </View>
            <View style={{ flex: 1 }} />
            <SkeletonBone width={28} height={28} borderRadius={14} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  textBlock: {
    marginVertical: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
});
