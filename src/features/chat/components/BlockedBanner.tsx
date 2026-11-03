import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Radius, Typography } from '../../../theme';
import { useT } from '../../../i18n';

interface BlockedBannerProps {
  onUnblock?: () => void;
  canUnblock?: boolean;
}

export const BlockedBanner: React.FC<BlockedBannerProps> = ({ onUnblock, canUnblock = false }) => {
  const { colors } = useDynamicStyles();
  const { t } = useT();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceDim,
          borderTopColor: colors.border + '30',
        },
      ]}
    >
      <Ionicons name="ban-outline" size={20} color={colors.danger} />
      <Text
        style={[
          styles.text,
          { color: colors.textPrimary, fontFamily: Typography.fontFamilyBody },
        ]}
      >
        {t('chat.blockedBanner')}
      </Text>
      {canUnblock && onUnblock && (
        <TouchableOpacity style={styles.unblockBtn} onPress={onUnblock}>
          <Text style={[styles.unblockText, { color: colors.primary }]}>
            {t('chat.unblockBtn')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: 13,
  },
  unblockBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unblockText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

