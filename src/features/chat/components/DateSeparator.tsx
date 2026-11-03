import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Radius, Typography } from '../../../theme';

interface DateSeparatorProps {
  label: string;
}

export const DateSeparator: React.FC<DateSeparatorProps> = React.memo(({ label }) => {
  const { colors } = useDynamicStyles();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.componentBase,
            borderColor: colors.border + '20',
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: colors.textSecondary,
              fontFamily: Typography.fontFamilyBody,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});

