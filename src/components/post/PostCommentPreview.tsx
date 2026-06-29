import React from 'react';
import { Text, StyleSheet, View, Image } from 'react-native';
import { useGetPublicUser } from '@/api/user/hooks/use-get-public-user';
import type { CommentWebResponse } from '@volontariapp/contracts';
import { theme } from '@/shared/themes/theme';

interface PostCommentPreviewProps {
  comment: CommentWebResponse;
}

export function PostCommentPreview({ comment }: PostCommentPreviewProps) {
  const { data: author } = useGetPublicUser(comment.authorId);
  const pseudo = author?.pseudo ?? 'Auteur inconnu';
  const seed = author?.pseudo ?? comment.authorId;
  const avatarUrl = `https://i.pravatar.cc/150?u=${seed}`;

  return (
    <View style={styles.container}>
      <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
      <Text style={styles.text} numberOfLines={2}>
        <Text style={styles.author}>@{pseudo}</Text> {comment.content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  avatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: theme.spacing.xs,
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.black,
    fontFamily: theme.typography.fonts.primary,
    lineHeight: 20,
  },
  author: {
    fontWeight: theme.typography.fontWeight.bold,
  },
});
