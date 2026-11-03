import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Radius, Typography } from '../../../theme';
import { useT } from '../../../i18n';

interface UnreadSeparatorProps {
  count: number;
}

export const UnreadSeparator: React.FC<UnreadSeparatorProps> = React.memo(({ count }) => {
  const { colors } = useDynamicStyles();
  const { t } = useT();

  const label =
    count === 1
      ? t('chat.unreadSeparatorSingle')
      : t('chat.unreadSeparator', { count });

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: colors.primary + '40' }]} />
      <View
        style={[
          styles.badge,
          {
            backgroundColor: colors.primary + '18',
            borderColor: colors.primary + '40',
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: colors.primary,
              fontFamily: Typography.fontFamilyDisplay,
            },
          ]}
        >
          {label}
        </Text>
      </View>
      <View style={[styles.line, { backgroundColor: colors.primary + '40' }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    paddingHorizontal: 8,
    gap: 8,
  },
  line: {
    flex: 1,
    height: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

