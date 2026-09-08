import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useGetPublicUser } from '@/api/user/hooks/use-get-public-user';
import type { CommentWebResponse } from '@volontariapp/contracts';
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

  const { data: author } = useGetPublicUser(comment.authorId);
  const pseudo = author?.pseudo ?? 'Auteur inconnu';
  const seed = author?.pseudo ?? comment.authorId;
  const avatarUrl = `https://i.pravatar.cc/150?u=${seed}`;

  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        navigation.navigate('PublicProfile', { userId: comment.authorId });
      }}
    >
      <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
      <Text style={styles.text} numberOfLines={2}>
        <Text style={styles.author}>@{pseudo}</Text> {comment.content}
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
      color: theme.colors.text,
      fontFamily: theme.typography.fonts.primary,
      lineHeight: 20,
    },
    author: {
      fontWeight: theme.typography.fontWeight.bold,
    },
  });
