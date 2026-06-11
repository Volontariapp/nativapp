import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/shared/themes/theme';
import type {PostWeb} from '@volontariapp/contracts';

interface PostCardProps {
  post: PostWeb;
}

export default function AppPost({ post }: PostCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.author}>Auteur : {post.authorId}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description}>{post.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    marginVertical: theme.spacing.sm,
    ...theme.shadows.card,
  },

  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
  },

  author: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.grey,
    fontFamily: theme.typography.fonts.primary,
  },

  content: {
    padding: theme.spacing.lg,
  },

  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fonts.primary,
  },

  description: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: 24,
    color: theme.colors.grey,
    fontFamily: theme.typography.fonts.primary,
  },
});
