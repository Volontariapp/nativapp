import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { theme } from '@/shared/themes/theme';
import type { PostWeb } from '@volontariapp/contracts';
import { useGetPublicUser } from '@/api/user/hooks/use-get-public-user';
import { useListComments } from '@/api/post/hooks/use-list-comments';
import { PostAuthorHeader } from './PostAuthorHeader';
import { PostImagePlaceholder } from './PostImagePlaceholder';
import { PostActions } from './PostActions';
import { PostCommentsModal } from './PostCommentsModal';
import { PostCommentPreview } from './PostCommentPreview';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import { convertEventDtoToAppEvent } from '@/api/event/event.api';

interface PostCardProps {
  post: PostWeb;
}

export default function AppPost({ post }: PostCardProps) {
  const { data: author } = useGetPublicUser(post.authorId);
  const { data: commentsData } = useListComments(post.id);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const pseudo = author?.pseudo ?? 'Auteur inconnu';
  const topComments = commentsData?.comments.slice(0, 3) ?? [];

  return (
    <View style={styles.card}>
      <PostAuthorHeader pseudo={author?.pseudo} authorId={post.authorId} />

      <PostImagePlaceholder postId={post.id} />

      {post.title ? (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{post.title}</Text>
        </View>
      ) : null}

      <PostActions
        commentCount={commentsData?.comments.length ?? 0}
        onCommentPress={() => {
          setIsCommentsVisible(true);
        }}
      />

      <View style={styles.content}>
        <Text style={styles.description}>
          <Text style={styles.authorPseudo}>@{pseudo} </Text>
          {post.content}
        </Text>

        {post.event && (
          <TouchableOpacity
            style={styles.eventLink}
            activeOpacity={0.7}
            onPress={() => {
              if (post.event) {
                const appEvent = convertEventDtoToAppEvent(post.event);
                navigation.navigate('EventDetail', { event: appEvent });
              }
            }}
          >
            <Icon name="search" size={14} color={theme.colors.primarySocio} />
            <Text style={styles.eventText}>{post.event.title}</Text>
          </TouchableOpacity>
        )}

        {topComments.length > 0 && (
          <View style={styles.commentsSection}>
            {topComments.map((comment) => (
              <PostCommentPreview key={comment.id} comment={comment} />
            ))}
          </View>
        )}
      </View>

      <PostCommentsModal
        postId={post.id}
        visible={isCommentsVisible}
        onClose={() => {
          setIsCommentsVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
  },
  titleContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
    fontFamily: theme.typography.fonts.primary,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
    color: theme.colors.black,
    fontFamily: theme.typography.fonts.primary,
    marginBottom: theme.spacing.sm,
  },
  authorPseudo: {
    fontWeight: theme.typography.fontWeight.bold,
  },
  commentsSection: {
    marginTop: theme.spacing.xs,
  },
  eventLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  eventText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primarySocio,
    fontWeight: theme.typography.fontWeight.semibold,
    fontFamily: theme.typography.fonts.primary,
  },
});
