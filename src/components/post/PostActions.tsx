import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/shared/themes/theme';
import Icon from 'react-native-vector-icons/Feather';

interface PostActionsProps {
  onCommentPress?: () => void;
  commentCount?: number;
}

export function PostActions({ onCommentPress, commentCount = 0 }: PostActionsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftActions}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Icon name="heart" size={20} color={theme.colors.black} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onCommentPress} activeOpacity={0.7}>
          <Icon name="message-square" size={20} color={theme.colors.black} />
          {commentCount > 0 && <Text style={styles.actionText}>{commentCount}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Icon name="share-2" size={20} color={theme.colors.black} />
        </TouchableOpacity>
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
