import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Shadows } from '../../../theme';

interface ScrollToBottomButtonProps {
  visible: boolean;
  unreadCount?: number;
  onPress: () => void;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  visible,
  unreadCount = 0,
  onPress,
}) => {
  const { colors } = useDynamicStyles();

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[
          styles.button,
          {
            backgroundColor: colors.canvasPure,
            borderColor: colors.border + '30',
          },
          Shadows.modal,
        ]}
      >
        <Ionicons name="chevron-down" size={20} color={colors.textPrimary} />

        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    zIndex: 10,
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});

