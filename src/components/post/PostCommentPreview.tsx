import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { UserAvatar } from '@/components/media/UserAvatar';
import { resolveAvatarUrl } from '@/api/user/resolve-avatar-url';
import { useGetPublicUser } from '@/api/user/hooks/use-get-public-user';
import type { CommentWebResponse } from '@volontariapp/contracts';
import { DELETED_USER_ID } from '@/shared/lib/user.constants';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';

interface PostCommentPreviewProps {
  comment: CommentWebResponse;
}

export function PostCommentPreview({ comment }: PostCommentPreviewProps) {
  const styles = useStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const isDeletedUser = comment.authorId === DELETED_USER_ID;
  const { data: author } = useGetPublicUser(isDeletedUser ? undefined : comment.authorId);
  const pseudo = isDeletedUser ? 'Utilisateur supprimé' : (author?.pseudo ?? 'Auteur inconnu');

  return (
    <Pressable
      style={styles.container}
      disabled={isDeletedUser}
      onPress={() => {
        if (!isDeletedUser) {
          navigation.navigate('PublicProfile', { userId: comment.authorId });
        }
      }}
    >
      <UserAvatar uri={resolveAvatarUrl(author)} size={20} style={styles.avatarSpacing} />
      <Text style={styles.text} numberOfLines={2}>
        <Text style={styles.author}>{pseudo}</Text> {comment.content}
      </Text>
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.xs,
    },
    avatarSpacing: {
      marginRight: theme.spacing.xs,
      marginTop: 2,
    },
    text: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      fontFamily: theme.typography.fonts.primary,
      lineHeight: 20,
    },
    author: {
      fontWeight: theme.typography.fontWeight.bold,
    },
  });
