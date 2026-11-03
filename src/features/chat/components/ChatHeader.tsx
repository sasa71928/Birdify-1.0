import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Avatar } from '../../../components/ui/Avatar';
import { IconButton } from '../../../components/ui/IconButton';
import { Typography } from '../../../theme';
import { ChatBootstrap } from '../types';
import { useT } from '../../../i18n';

interface ChatHeaderProps {
  meta?: ChatBootstrap;
  isOtherTyping?: boolean;
  onBack: () => void;
  onPressInfo: () => void;
  onPressMenu: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  meta,
  isOtherTyping = false,
  onBack,
  onPressInfo,
  onPressMenu,
}) => {
  const { colors } = useDynamicStyles();
  const { t } = useT();

  const isGroup = Boolean(meta?.conversation.is_group);
  const title = isGroup
    ? (meta?.conversation.name || 'Grupo')
    : (meta?.members.find((m) => m.id === meta?.otherUserId)?.fullname ||
       meta?.members.find((m) => m.id === meta?.otherUserId)?.username ||
       'Usuario');

  const avatarUri = isGroup
    ? meta?.conversation.avatar_url
    : meta?.members.find((m) => m.id === meta?.otherUserId)?.profile_pic_url;

  const membersCount = meta?.members.length || 0;

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border + '20',
        },
      ]}
    >
      <IconButton
        onPress={onBack}
        accessibilityLabel={t('common.back')}
        size={40}
        style={styles.backBtn}
      >
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </IconButton>

      <TouchableOpacity
        style={styles.centerArea}
        activeOpacity={0.75}
        onPress={onPressInfo}
      >
        <Avatar
          uri={avatarUri}
          name={title}
          size={38}
          isGroup={isGroup}
        />

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: colors.textPrimary, fontFamily: Typography.fontFamilyDisplay },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>

          {isOtherTyping ? (
            <Text style={[styles.subtitle, { color: colors.primary }]}>
              {t('chat.typing')}
            </Text>
          ) : isGroup ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('chat.membersCount', { count: membersCount })}
            </Text>
          ) : (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('chat.tapForInfo')}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <IconButton
        onPress={onPressMenu}
        accessibilityLabel="Opciones de chat"
        size={40}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
      </IconButton>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  backBtn: {
    marginRight: 4,
  },
  centerArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
});

