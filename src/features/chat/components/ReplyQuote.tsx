import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ChatReplyInfo } from '../types';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Radius, Typography } from '../../../theme';

interface ReplyQuoteProps {
  reply: ChatReplyInfo;
  isMine: boolean;
  onPress?: () => void;
}

export const ReplyQuote: React.FC<ReplyQuoteProps> = React.memo(
  ({ reply, isMine, onPress }) => {
    const { colors } = useDynamicStyles();

    const barColor = isMine ? colors.primaryLight : colors.primary;
    const bgColor = isMine ? colors.quoteMineBg : colors.quoteTheirsBg;
    const authorColor = isMine ? colors.primaryLight : colors.primary;
    const textColor = isMine ? colors.bubbleMineText : colors.textPrimary;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!onPress}
        onPress={onPress}
        style={[
          styles.container,
          {
            backgroundColor: bgColor,
            borderLeftColor: barColor,
          },
        ]}
      >
        <View style={styles.textColumn}>
          <Text
            style={[
              styles.authorText,
              { color: authorColor, fontFamily: Typography.fontFamilyDisplay },
            ]}
            numberOfLines={1}
          >
            {reply.senderName}
          </Text>
          <Text
            style={[
              styles.contentText,
              { color: textColor, opacity: 0.9, fontFamily: Typography.fontFamilyBody },
            ]}
            numberOfLines={1}
          >
            {reply.text || (reply.imagePath ? '📷 Foto' : '')}
          </Text>
        </View>

        {reply.imagePath && (
          <Image
            source={{ uri: reply.imagePath }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
          />
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    marginBottom: 5,
    gap: 8,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  authorText: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 1,
  },
  contentText: {
    fontSize: 12,
  },
  thumbnail: {
    width: 36,
    height: 36,
    borderRadius: 4,
  },
});

