import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';

interface AdminInspectorPostItemProps {
  postId: string;
}

export function AdminInspectorPostItem({ postId }: AdminInspectorPostItemProps): React.JSX.Element {
  return (
    <View style={styles.postItem}>
      <AppText style={styles.postText}>Post ID: {postId}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  postItem: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.lightGrey + '40',
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
  },
  postText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.black,
  },
});
