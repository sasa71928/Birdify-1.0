import React from 'react';
import { View, Text } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '../animated/PressableScale';
import { BirdSpeciesData } from '../../navigation/AppNavigator';

interface BirdGridCardProps {
  bird: BirdSpeciesData;
  onPress: () => void;
  styles: any;
  colors: any;
}

export const BirdGridCard: React.FC<BirdGridCardProps> = React.memo(({
  bird,
  onPress,
  styles,
  colors,
}) => {
  const isMigratory = bird.status === 'MIGRATORIA';

  return (
    <PressableScale
      activeScale={0.96}
      haptic="light"
      style={styles.gridCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={bird.name}
    >
      <View style={styles.gridImageWrapper}>
        <ExpoImage
          source={{ uri: bird.image }}
          style={styles.gridImage}
          contentFit="cover"
          transition={180}
          cachePolicy="memory-disk"
        />

        {/* Status Pill */}
        <View
          style={[
            styles.statusPill,
            isMigratory ? styles.statusPillMigratory : styles.statusPillResident,
          ]}
        >
          <Ionicons
            name={isMigratory ? 'airplane' : 'home'}
            size={10}
            color="#FFFFFF"
          />
          <Text style={styles.statusPillText}>
            {isMigratory ? 'Migratoria' : 'Residente'}
          </Text>
        </View>
      </View>

      <View style={styles.gridInfo}>
        <Text style={styles.gridBirdName} numberOfLines={2}>
          {bird.name}
        </Text>
        <Text style={styles.gridScientificName} numberOfLines={1}>
          {bird.scientificName}
        </Text>

        {bird.habitat && (
          <View style={styles.gridMetaRow}>
            <Ionicons name="leaf-outline" size={11} color={colors.textSecondary} />
            <Text style={styles.gridMetaText} numberOfLines={1}>
              {bird.habitat.split(',')[0]}
            </Text>
          </View>
        )}
      </View>
    </PressableScale>
  );
});

