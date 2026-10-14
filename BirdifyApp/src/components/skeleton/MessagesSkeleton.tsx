import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonBone } from './SkeletonBone';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';

export const MessagesSkeleton: React.FC = () => {
  const { colors, isDark } = useDynamicStyles();
  const dividerColor = isDark ? '#262A26' : '#F0F4EF';

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Barra de búsqueda skeleton */}
      <View style={styles.searchBar}>
        <SkeletonBone width="100%" height={44} borderRadius={12} />
      </View>

      {/* Lista de conversaciones */}
      {[1, 2, 3, 4, 5, 6, 7].map((item) => (
        <View key={item}>
          <View style={styles.row}>
            {/* Avatar */}
            <SkeletonBone width={52} height={52} borderRadius={26} />

            {/* Contenido del mensaje */}
            <View style={styles.content}>
              <View style={styles.topRow}>
                <SkeletonBone width={130} height={15} borderRadius={6} />
                <SkeletonBone width={45} height={11} borderRadius={4} />
              </View>
              <SkeletonBone
                width={item % 2 === 0 ? '85%' : '65%'}
                height={13}
                borderRadius={5}
                style={{ marginTop: 6 }}
              />
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
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
  searchBar: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginLeft: 66,
  },
});
