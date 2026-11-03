import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '../../../components/ui/Avatar';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Radius, Typography } from '../../../theme';
import { useT } from '../../../i18n';

interface EmptyChatProps {
  name: string;
  avatarUrl?: string | null;
  isGroup?: boolean;
  onSendWave?: () => void;
}

export const EmptyChat: React.FC<EmptyChatProps> = ({
  name,
  avatarUrl,
  isGroup = false,
  onSendWave,
}) => {
  const { colors } = useDynamicStyles();
  const { t } = useT();

  return (
    <View style={styles.container}>
      <Avatar uri={avatarUrl} name={name} size={72} isGroup={isGroup} />
      <Text
        style={[
          styles.title,
          { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
        ]}
      >
        {t('chat.emptyTitle', { name })}
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: colors.textSecondary, fontFamily: Typography.fontFamilyBody },
        ]}
      >
        {t('chat.emptySubtitle')}
      </Text>

      {onSendWave && (
        <TouchableOpacity
          style={[styles.waveBtn, { backgroundColor: colors.componentBase }]}
          activeOpacity={0.7}
          onPress={onSendWave}
        >
          <Text style={styles.waveEmoji}>👋</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  waveBtn: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  waveEmoji: {
    fontSize: 26,
  },
});

