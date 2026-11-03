import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../hooks/useDynamicStyles';
import { Typography } from '../../theme';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
  isGroup?: boolean;
  isOnline?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = React.memo(
  ({ uri, name, size = 44, isGroup = false, isOnline = false, style }) => {
    const { colors } = useDynamicStyles();
    const [hasError, setHasError] = useState(false);

    const borderRadius = size / 2;
    const cleanUri = uri && uri.trim() !== '' ? uri : null;

    // Calcular iniciales para fallback
    const getInitials = (text?: string | null) => {
      if (!text) return '?';
      const parts = text.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const fontSize = Math.max(11, Math.round(size * 0.38));

    return (
      <View style={[{ width: size, height: size }, styles.container, style]}>
        {isGroup && !cleanUri ? (
          <View
            style={[
              styles.fallback,
              {
                width: size,
                height: size,
                borderRadius,
                backgroundColor: colors.primary + '18',
              },
            ]}
          >
            <Ionicons name="people" size={Math.round(size * 0.52)} color={colors.primary} />
          </View>
        ) : cleanUri && !hasError ? (
          <Image
            source={{ uri: cleanUri }}
            style={{ width: size, height: size, borderRadius }}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
            onError={() => setHasError(true)}
          />
        ) : (
          <View
            style={[
              styles.fallback,
              {
                width: size,
                height: size,
                borderRadius,
                backgroundColor: colors.componentBase,
                borderWidth: 1,
                borderColor: colors.border + '30',
              },
            ]}
          >
            <Text
              style={[
                styles.initials,
                {
                  fontSize,
                  color: colors.textPrimary,
                  fontFamily: Typography.fontFamilyDisplay,
                },
              ]}
            >
              {getInitials(name)}
            </Text>
          </View>
        )}

        {isOnline && (
          <View
            style={[
              styles.onlineBadge,
              {
                width: Math.max(10, size * 0.25),
                height: Math.max(10, size * 0.25),
                borderRadius: Math.max(5, (size * 0.25) / 2),
                borderColor: colors.surface,
              },
            ]}
          />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#34A853',
    borderWidth: 2,
  },
});

