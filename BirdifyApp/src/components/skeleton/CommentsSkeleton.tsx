import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBone } from './SkeletonBone';

interface CommentsSkeletonProps {
  count?: number;
}

export const CommentsSkeleton: React.FC<CommentsSkeletonProps> = ({ count = 4 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.commentRow}>
          {/* Avatar Bone */}
          <SkeletonBone width={34} height={34} borderRadius={17} style={styles.avatar} />

          {/* Comment Bubble Content */}
          <View style={styles.content}>
            {/* Username */}
            <SkeletonBone
              width={i % 2 === 0 ? 110 : 85}
              height={14}
              borderRadius={6}
              style={styles.username}
            />

            {/* Comment Line 1 */}
            <SkeletonBone
              width={i % 2 === 0 ? '92%' : '80%'}
              height={12}
              borderRadius={6}
              style={styles.line}
            />

            {/* Comment Line 2 (solo en algunos para variedad natural) */}
            {i % 2 === 0 && (
              <SkeletonBone
                width="65%"
                height={12}
                borderRadius={6}
                style={styles.line}
              />
            )}

            {/* Botones de acción (Responder, Hora) */}
            <View style={styles.actions}>
              <SkeletonBone width={50} height={10} borderRadius={5} />
              <SkeletonBone width={38} height={10} borderRadius={5} />
            </View>

            {/* Respuesta anidada en el segundo comentario para simular hilo */}
            {i === 1 && (
              <View style={styles.nestedReply}>
                <SkeletonBone width={26} height={26} borderRadius={13} style={styles.nestedAvatar} />
                <View style={styles.nestedContent}>
                  <SkeletonBone width={80} height={12} borderRadius={6} style={styles.username} />
                  <SkeletonBone width="85%" height={11} borderRadius={6} style={styles.line} />
                </View>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  avatar: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  username: {
    marginBottom: 2,
  },
  line: {
    marginBottom: 3,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  nestedReply: {
    flexDirection: 'row',
    marginTop: 12,
    paddingLeft: 4,
    alignItems: 'flex-start',
  },
  nestedAvatar: {
    marginRight: 10,
    marginTop: 2,
  },
  nestedContent: {
    flex: 1,
    gap: 5,
  },
});
