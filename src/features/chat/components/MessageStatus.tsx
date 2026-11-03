import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { MessageStatus as StatusType } from '../types';
import { formatMessageTime } from '../utils/formatters';
import { useT } from '../../../i18n';

interface MessageStatusProps {
  status: StatusType;
  createdAt: string;
  isMine: boolean;
  onRetry?: () => void;
  onDiscard?: () => void;
}

export const MessageStatus: React.FC<MessageStatusProps> = React.memo(
  ({ status, createdAt, isMine, onRetry, onDiscard }) => {
    const { colors } = useDynamicStyles();
    const { locale } = useT();

    const timeStr = formatMessageTime(createdAt, locale);
    const metaColor = isMine ? colors.bubbleMineMeta : colors.bubbleTheirsMeta;

    if (status === 'failed' && isMine) {
      return (
        <View style={styles.failedRow}>
          <Text style={[styles.timeText, { color: colors.danger }]}>{timeStr}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            activeOpacity={0.7}
            onPress={onRetry}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="alert-circle" size={14} color={colors.danger} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={[styles.timeText, { color: metaColor }]}>{timeStr}</Text>
        {isMine && (
          <View style={styles.iconWrap}>
            {status === 'sending' && (
              <Ionicons name="time-outline" size={12} color={metaColor} />
            )}
            {status === 'sent' && (
              <Ionicons name="checkmark" size={13} color={metaColor} />
            )}
            {status === 'read' && (
              <Ionicons name="checkmark-done" size={14} color={colors.readTick} />
            )}
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 3,
    marginTop: 2,
    marginLeft: 8,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  failedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  retryBtn: {
    padding: 2,
  },
});

