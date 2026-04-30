import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export interface Post {
  id: string;
  username: string;
  userAvatar: string;
  location: string;
  image: string;
  tag: string;
  likes: number;
  comments: number;
  caption: string;
  timeAgo: string;
  isVerified?: boolean;
}

interface FeedItemProps {
  post: Post;
}

export default function FeedItem({ post }: FeedItemProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
          <View style={styles.userText}>
            <View style={styles.nameRow}>
              <Text style={styles.username}>{post.username}</Text>
              {post.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color="#458eff" style={styles.verifiedIcon} />
              )}
            </View>
            <Text style={styles.location}>{post.location}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Image Content */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: post.image }} style={styles.postImage} />
        <View style={styles.tagBadge}>
          <Ionicons name="information-circle-outline" size={16} color="#5D4037" />
          <Text style={styles.tagText}>{post.tag}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={26} color={Colors.textPrimary} />
            <Text style={styles.actionText}>{post.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="comment-outline" size={24} color={Colors.textPrimary} />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={styles.caption}>
          <Text style={styles.captionUsername}>{post.username} </Text>
          {post.caption}
        </Text>
        <Text style={styles.timeAgo}>{post.timeAgo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  userText: {
    marginLeft: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  location: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  tagText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#5D4037',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    marginLeft: 4,
    fontWeight: Typography.fontWeight.medium,
  },
  captionContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  caption: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.tight,
  },
  captionUsername: {
    fontWeight: Typography.fontWeight.bold,
  },
  timeAgo: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
});
