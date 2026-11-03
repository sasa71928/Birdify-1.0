import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ReactionSummary } from '../types';
import { useDynamicStyles } from '../../../hooks/useDynamicStyles';
import { Radius } from '../../../theme';

interface ReactionChipsProps {
  reactions: ReactionSummary[];
  isMine: boolean;
  onToggleReaction: (emoji: string) => void;
}

export const ReactionChips: React.FC<ReactionChipsProps> = React.memo(
  ({ reactions, isMine, onToggleReaction }) => {
    const { colors } = useDynamicStyles();

    if (!reactions || reactions.length === 0) return null;

    return (
      <View style={[styles.container, isMine ? styles.containerMine : styles.containerTheirs]}>
        {reactions.map((r) => {
          const isSelected = r.mine;
          return (
            <TouchableOpacity
              key={r.emoji}
              activeOpacity={0.7}
              onPress={() => onToggleReaction(r.emoji)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.primary + '20' : colors.canvasPure,
                  borderColor: isSelected ? colors.primary : colors.border + '30',
                },
              ]}
            >
              <Text style={styles.emojiText}>{r.emoji}</Text>
              {r.count > 1 && (
                <Text
                  style={[
                    styles.countText,
                    { color: isSelected ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {r.count}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  containerMine: {
    justifyContent: 'flex-end',
  },
  containerTheirs: {
    justifyContent: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 3,
  },
  emojiText: {
    fontSize: 12,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

