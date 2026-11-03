import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Typography, Radius } from '../../../theme';
import { ChatMessage } from '../types';
import { useT } from '../../../i18n';

interface MessageActionsSheetProps {
  visible: boolean;
  message: ChatMessage | null;
  currentUserId?: string;
  onClose: () => void;
  onReply: (message: ChatMessage) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onDeleteForMe: (message: ChatMessage) => void;
  onDeleteForEveryone: (message: ChatMessage) => void;
  onReport: (message: ChatMessage) => void;
  onShowToast: (msg: string) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const MessageActionsSheet: React.FC<MessageActionsSheetProps> = ({
  visible,
  message,
  currentUserId,
  onClose,
  onReply,
  onToggleReaction,
  onDeleteForMe,
  onDeleteForEveryone,
  onReport,
  onShowToast,
}) => {
  const { colors } = useDynamicStyles();
  const { t } = useT();

  if (!message) return null;

  const isMine = message.senderId === currentUserId;

  const handleCopy = async () => {
    if (message.text) {
      await Clipboard.setStringAsync(message.text);
      onShowToast(t('chat.messageOptions.copySuccess'));
    }
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* Barra de reacciones rápidas */}
        {!message.isDeleted && (
          <View style={styles.reactionsBar}>
            {QUICK_REACTIONS.map((emoji) => {
              const hasMine = message.reactions.some((r) => r.emoji === emoji && r.mine);
              return (
                <TouchableOpacity
                  key={emoji}
                  activeOpacity={0.7}
                  onPress={() => {
                    onToggleReaction(message.id, emoji);
                    onClose();
                  }}
                  style={[
                    styles.reactionBtn,
                    {
                      backgroundColor: hasMine ? colors.primary + '20' : colors.componentBase,
                      borderColor: hasMine ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: colors.border + '20' }]} />

        {/* Acciones */}
        <View style={styles.actionsList}>
          {!message.isDeleted && (
            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => {
                onReply(message);
                onClose();
              }}
            >
              <Ionicons name="arrow-undo-outline" size={20} color={colors.textPrimary} />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
                {t('chat.messageOptions.reply')}
              </Text>
            </TouchableOpacity>
          )}

          {Boolean(message.text) && !message.isDeleted && (
            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={handleCopy}>
              <Ionicons name="copy-outline" size={20} color={colors.textPrimary} />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>
                {t('chat.messageOptions.copy')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              onDeleteForMe(message);
            }}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={[styles.actionLabel, { color: colors.danger }]}>
              {t('chat.messageOptions.deleteForMe')}
            </Text>
          </TouchableOpacity>

          {isMine && !message.isDeleted && (
            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onDeleteForEveryone(message);
              }}
            >
              <Ionicons name="trash-bin-outline" size={20} color={colors.danger} />
              <Text style={[styles.actionLabel, { color: colors.danger }]}>
                {t('chat.messageOptions.deleteForEveryone')}
              </Text>
            </TouchableOpacity>
          )}

          {!isMine && (
            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onReport(message);
              }}
            >
              <Ionicons name="flag-outline" size={20} color={colors.warning} />
              <Text style={[styles.actionLabel, { color: colors.warning }]}>
                {t('chat.messageOptions.report')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  reactionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  reactionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  reactionEmoji: {
    fontSize: 22,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  actionsList: {
    gap: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
    gap: 14,
  },
  actionLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },
});

