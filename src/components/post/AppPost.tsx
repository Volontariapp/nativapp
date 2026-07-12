import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
import { useLikePost } from '@/api/social/hooks/use-like-post';
import { useUnlikePost } from '@/api/social/hooks/use-unlike-post';
import { useGetMyLikes } from '@/api/social/hooks/use-get-my-likes';
import { useGetPostLikers } from '@/api/user/hooks/use-get-post-likers';
import { PostLikersModal } from './PostLikersModal';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface PostCardProps {
  post: PostWeb;
}

export default function AppPost({ post }: PostCardProps) {
  const { data: author } = useGetPublicUser(post.authorId);
  const { data: commentsData } = useListComments(post.id);
  const { data: myLikesData } = useGetMyLikes();
  const { data: likersData } = useGetPostLikers(post.id, { limit: 1 });

  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isLikersVisible, setIsLikersVisible] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const pseudo = author?.pseudo ?? 'Auteur inconnu';
  const topComments = commentsData?.comments.slice(0, 3) ?? [];
  const isLiked = myLikesData?.ids.includes(post.id) ?? false;

  let likeCount = likersData?.totalCount ?? 0;
  if (isLiked && likeCount === 0) {
    likeCount = 1;
  }

  useEffect(() => {
    console.log(`[AppPost ${post.id}] myLikesData:`, myLikesData?.ids);
    console.log(`[AppPost ${post.id}] likersData totalCount:`, likersData?.totalCount);
    console.log(
      `[AppPost ${post.id}] Computed -> isLiked: ${String(isLiked)}, likeCount: ${String(likeCount)}`,
    );
  }, [isLiked, likeCount, post.id, myLikesData, likersData]);

  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  const animatedHeartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: heartScale.value }],
      opacity: heartOpacity.value,
    };
  });

  const triggerLikeAnimation = () => {
    heartOpacity.value = 1;
    heartScale.value = withSequence(
      withSpring(1, { damping: 12, stiffness: 300, mass: 0.5 }),
      withDelay(
        50,
        withTiming(0, { duration: 150 }, () => {
          heartOpacity.value = 0;
        }),
      ),
    );
  };

  const handleToggleLike = () => {
    if (isLiked) {
      unlikePost.mutate(post.id);
    } else {
      likePost.mutate(post.id);
      triggerLikeAnimation();
    }
  };

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      triggerLikeAnimation();
      if (!isLiked) {
        handleToggleLike();
      }
    })
    .runOnJS(true);

  return (
    <View style={styles.card}>
      <PostAuthorHeader pseudo={author?.pseudo} authorId={post.authorId} />

      <GestureDetector gesture={doubleTapGesture}>
        <View style={styles.imageWrapper}>
          <PostImagePlaceholder postId={post.id} />
          <Animated.View style={[styles.floatingHeart, animatedHeartStyle]} pointerEvents="none">
            <Ionicons name="heart" size={100} color={theme.colors.danger} />
          </Animated.View>
        </View>
      </GestureDetector>

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
        isLiked={isLiked}
        likeCount={likeCount}
        onLikePress={handleToggleLike}
        onLikeCountPress={() => {
          setIsLikersVisible(true);
        }}
      />

      <View style={styles.content}>
        <Text style={styles.description}>
          <Text style={styles.authorPseudo}>@{pseudo} </Text>
          {post.content}
        </Text>

        {post.event && (
          <Pressable
            style={styles.eventLink}
            onPress={() => {
              if (post.event) {
                const appEvent = convertEventDtoToAppEvent(post.event);
                navigation.navigate('EventDetail', { event: appEvent });
              }
            }}
          >
            <Icon name="search" size={14} color={theme.colors.primarySocio} />
            <Text style={styles.eventText}>{post.event.title}</Text>
          </Pressable>
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

      <PostLikersModal
        postId={post.id}
        visible={isLikersVisible}
        onClose={() => {
          setIsLikersVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
  },
  imageWrapper: {
    position: 'relative',
  },
  floatingHeart: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
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
