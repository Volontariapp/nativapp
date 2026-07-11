import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import { useGetPublicUser } from '@/api/user/hooks/use-get-public-user';
import { useDeleteComment } from '@/api/post/hooks/use-delete-comment';
import { useAuth } from '@/context/AuthContext';
import type { CommentWebResponse } from '@volontariapp/contracts';

interface CommentItemProps {
  comment: CommentWebResponse;
}

export function CommentItem({ comment }: CommentItemProps) {
  const { userId } = useAuth();
  const { data: author } = useGetPublicUser(comment.authorId);
  const { mutate: deleteComment, isPending } = useDeleteComment(comment.postId);

  const pseudo = author?.pseudo ?? 'Auteur inconnu';
  const seed = author?.pseudo ?? comment.authorId;
  const avatarUrl = `https://i.pravatar.cc/150?u=${seed}`;
  const date = new Date(comment.createdAt).toLocaleDateString('fr-FR');
  const isMine = userId === comment.authorId;

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer ce commentaire ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          deleteComment(comment.id);
        },
      },
    ]);
  };

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.authorContainer}>
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          <AppText style={styles.author}>{pseudo}</AppText>
        </View>
        <View style={styles.actionsContainer}>
          <AppText style={styles.date}>{date}</AppText>
          {isMine && (
            <Pressable onPress={handleDelete} disabled={isPending} style={styles.deleteButton}>
              <Icon name="trash-2" size={16} color={theme.colors.danger} />
            </Pressable>
          )}
        </View>
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
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
});
