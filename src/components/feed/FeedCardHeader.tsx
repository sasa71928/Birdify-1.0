import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { Colors } from '../../theme';
import { useT } from '../../i18n';
import { Post } from '../FeedItem';

interface FeedCardHeaderProps {
  post: Post;
  styles: any;
  navigation: any;
  onNavigateAway?: () => void;
  onOptionsPress: () => void;
}

export const FeedCardHeader: React.FC<FeedCardHeaderProps> = React.memo(({
  post,
  styles,
  navigation,
  onNavigateAway,
  onOptionsPress,
}) => {
  const { t } = useT();

  const handleLocationPress = () => {
    if (post.latitude != null && post.longitude != null && post.location !== 'Ubicación Privada') {
      const targetSighting = {
        id: post.id,
        latitude: post.latitude,
        longitude: post.longitude,
      };
      onNavigateAway?.();
      try {
        navigation.navigate('MainTabs', {
          screen: 'Explore',
          params: { targetSighting },
        });
      } catch {
        navigation.navigate('Explore', { targetSighting });
      }
    }
  };

  const handleUserPress = () => {
    if (post.userId) {
      onNavigateAway?.();
      navigation.navigate('Profile', { userId: post.userId });
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.userInfo}
        activeOpacity={0.7}
        onPress={handleUserPress}
      >
        <ExpoImage
          source={{ uri: post.userAvatar || 'https://gravatar.com/avatar/?d=mp' }}
          style={styles.avatar}
          contentFit="cover"
          transition={150}
        />
        <View style={styles.userText}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>{post.username}</Text>
            {post.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
            )}
            {post.syncStatus && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  borderRadius: 99,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  backgroundColor: post.syncStatus === 'pending' ? '#fef3c7' : '#dcfce7',
                }}
              >
                <Ionicons
                  name={
                    post.syncStatus === 'pending'
                      ? 'cloud-upload-outline'
                      : 'cloud-done-outline'
                  }
                  size={12}
                  color={post.syncStatus === 'pending' ? '#92400e' : '#166534'}
                />
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: 'PlusJakartaSans-SemiBold',
                    color: post.syncStatus === 'pending' ? '#92400e' : '#166534',
                  }}
                >
                  {post.syncStatus === 'pending'
                    ? t('feed.syncStatusPending')
                    : t('feed.syncStatusSynced')}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            disabled={
              post.latitude == null ||
              post.longitude == null ||
              post.location === 'Ubicación Privada'
            }
            onPress={handleLocationPress}
          >
            <Text style={styles.location}>{post.location}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onOptionsPress}>
        <MaterialCommunityIcons name="dots-horizontal" size={24} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
});
