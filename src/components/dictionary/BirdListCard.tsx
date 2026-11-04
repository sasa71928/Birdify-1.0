import React from 'react';
import { View, Text } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '../animated/PressableScale';
import { BirdSpeciesData } from '../../navigation/AppNavigator';

interface BirdListCardProps {
  bird: BirdSpeciesData;
  onPress: () => void;
  styles: any;
  colors: any;
}

export const BirdListCard: React.FC<BirdListCardProps> = React.memo(({
  bird,
  onPress,
  styles,
  colors,
}) => {
  const isMigratory = bird.status === 'MIGRATORIA';

  return (
    <PressableScale
      activeScale={0.97}
      haptic="light"
      style={styles.listCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={bird.name}
    >
      <View style={styles.listImageWrapper}>
        <ExpoImage
          source={{ uri: bird.image }}
          style={styles.listImage}
          contentFit="cover"
          transition={180}
          cachePolicy="memory-disk"
        />
      </View>

      <View style={styles.listInfo}>
        <Text style={styles.listBirdName} numberOfLines={1}>
          {bird.name}
        </Text>
        <Text style={styles.listScientificName} numberOfLines={1}>
          {bird.scientificName}
        </Text>

        <View style={styles.listTagsRow}>
          <View
            style={[
              styles.miniTag,
              { backgroundColor: isMigratory ? colors.secondaryBlue + '18' : colors.primary + '18' },
            ]}
          >
            <Text
              style={[
                styles.miniTagText,
                { color: isMigratory ? colors.secondaryBlue : colors.primary },
              ]}
            >
              {isMigratory ? 'Migratoria' : 'Residente'}
            </Text>
          </View>

          {bird.habitat && (
            <View style={styles.miniTag}>
              <Text style={styles.miniTagText} numberOfLines={1}>
                {bird.habitat.split(',')[0]}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={{ opacity: 0.6 }} />
    </PressableScale>
  );
});

