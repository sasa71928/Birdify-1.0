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

import styles from '../styles/FeedItem.styles';

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
