import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import { useGetPublicUser } from '@/api/user/hooks/use-get-public-user';
import type { CommentWebResponse } from '@volontariapp/contracts';

interface CommentItemProps {
  comment: CommentWebResponse;
}

export function CommentItem({ comment }: CommentItemProps) {
  const { data: author } = useGetPublicUser(comment.authorId);
  const pseudo = author?.pseudo ?? 'Auteur inconnu';
  const seed = author?.pseudo ?? comment.authorId;
  const avatarUrl = `https://i.pravatar.cc/150?u=${seed}`;
  const date = new Date(comment.createdAt).toLocaleDateString('fr-FR');

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.authorContainer}>
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          <AppText style={styles.author}>{pseudo}</AppText>
        </View>
        <AppText style={styles.date}>{date}</AppText>
      </View>
      <AppText style={styles.content}>{comment.content}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  commentCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.black,
    borderRadius: 0,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: theme.spacing.sm,
  },
  author: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  date: {
    fontFamily: theme.typography.fonts.secondary,
    color: theme.colors.grey,
    fontSize: 12,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: theme.typography.fonts.primary,
  },
});
