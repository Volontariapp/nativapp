import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/shared/themes/theme';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface PostActionsProps {
  onCommentPress?: () => void;
  commentCount?: number;
  isLiked?: boolean;
  likeCount?: number;
  onLikePress?: () => void;
  onLikeCountPress?: () => void;
}

export function PostActions({
  onCommentPress,
  commentCount = 0,
  isLiked = false,
  likeCount = 0,
  onLikePress,
  onLikeCountPress,
}: PostActionsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftActions}>
        <View style={styles.actionGroup}>
          <Pressable style={styles.iconButton} onPress={onLikePress}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? theme.colors.danger : theme.colors.black}
            />
          </Pressable>
          {likeCount >= 0 && (
            <Pressable onPress={onLikeCountPress}>
              <Text style={styles.actionText}>{likeCount}</Text>
            </Pressable>
          )}
        </View>

        <Pressable style={styles.iconButton} onPress={onCommentPress}>
          <Icon name="message-square" size={20} color={theme.colors.black} />
          {commentCount > 0 && <Text style={styles.actionText}>{commentCount}</Text>}
        </Pressable>

        <Pressable style={styles.iconButton}>
          <Icon name="share-2" size={20} color={theme.colors.black} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.black,
    fontFamily: theme.typography.fonts.primary,
  },
});
