import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme';

interface FeedCardActionsProps {
  liked: boolean;
  likesCount: number;
  commentsCount: number;
  onLikePress: () => void;
  onCommentPress: () => void;
  onSharePress: () => void;
  styles: any;
}

export const FeedCardActions: React.FC<FeedCardActionsProps> = React.memo(({
  liked,
  likesCount,
  commentsCount,
  onLikePress,
  onCommentPress,
  onSharePress,
  styles,
}) => {
  return (
    <View style={styles.actions}>
      <View style={styles.leftActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onLikePress}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={26}
            color={liked ? '#FF5252' : Colors.primary}
          />
          <Text style={[styles.actionText, liked && { color: '#FF5252' }]}>
            {likesCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onCommentPress}>
          <MaterialCommunityIcons
            name="comment-outline"
            size={24}
            color={Colors.primary}
          />
          <Text style={styles.actionText}>{commentsCount}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onSharePress}>
        <Ionicons name="share-outline" size={24} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
});

