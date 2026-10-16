import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { UserAvatar } from '@/components/media/UserAvatar';
import { resolveAvatarUrl } from '@/api/user/resolve-avatar-url';
import Icon from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useGetPublicUser } from '@/api/user/hooks/use-get-public-user';
import { useDeleteComment } from '@/api/post/hooks/use-delete-comment';
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import type { CommentWebResponse } from '@volontariapp/contracts';
import { DELETED_USER_ID } from '@/shared/lib/user.constants';

interface CommentItemProps {
  comment: CommentWebResponse;
}

export function CommentItem({ comment }: CommentItemProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { userId } = useAuth();
  const isDeletedUser = comment.authorId === DELETED_USER_ID;
  const { data: author } = useGetPublicUser(isDeletedUser ? undefined : comment.authorId);
  const { mutate: deleteComment, isPending } = useDeleteComment(comment.postId);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const pseudo = isDeletedUser ? 'Utilisateur supprimé' : (author?.pseudo ?? 'Auteur inconnu');
  const date = new Date(comment.createdAt).toLocaleDateString('fr-FR');
  const isMine = !isDeletedUser && userId === comment.authorId;

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
        <Pressable
          style={styles.authorContainer}
          disabled={isDeletedUser}
          onPress={() => {
            if (!isDeletedUser) {
              navigation.navigate('PublicProfile', { userId: comment.authorId });
            }
          }}
        >
          <UserAvatar uri={resolveAvatarUrl(author)} size={24} style={styles.avatarSpacing} />
          <AppText style={styles.author}>{pseudo}</AppText>
        </Pressable>
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    commentCard: {
      backgroundColor: theme.colors.white,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      borderRadius: theme.radius.sm,
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
    avatarSpacing: {
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
