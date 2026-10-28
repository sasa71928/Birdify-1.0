import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonBone } from './SkeletonBone';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

export const DictionarySkeleton: React.FC = () => {
  const { isDark } = useDynamicStyles();
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#2D322D' : '#EDF2EC';

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Header de sección */}
      <View style={styles.sectionHeader}>
        <SkeletonBone width={100} height={18} borderRadius={6} />
      </View>

      {/* Lista de tarjetas de aves */}
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <View
          key={item}
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor },
          ]}
        >
          {/* Foto del ave */}
          <SkeletonBone width={72} height={72} borderRadius={12} />

          {/* Información */}
          <View style={styles.info}>
            <SkeletonBone width={item % 2 === 0 ? 160 : 130} height={16} borderRadius={6} style={{ marginBottom: 8 }} />
            <SkeletonBone width={110} height={12} borderRadius={5} style={{ marginBottom: 6 }} />
            <SkeletonBone width={65} height={10} borderRadius={4} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginVertical: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
});
