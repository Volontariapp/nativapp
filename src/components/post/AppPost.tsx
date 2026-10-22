import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { PostWeb } from '@volontariapp/contracts';
import { useGetPublicUser } from '@/api/user/hooks/use-get-public-user';
import { useListComments } from '@/api/post/hooks/use-list-comments';
import { PostAuthorHeader } from './PostAuthorHeader';
import { resolveAvatarUrl } from '@/api/user/resolve-avatar-url';
import { PostImage } from './post-image';
import { resolvePostImageUrl } from '@/api/post/resolve-post-image-url';
import { useDebug } from '@/context/DebugContext';
import { formatRankingScore, getRankingReasonLabel, type RankedAppPost } from '@/api/ranking';
import { RankingDebugDetailModal } from '@/components/feedback';
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
  cancelAnimation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface PostCardProps {
  post: PostWeb;
}

export default function AppPost({ post }: PostCardProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { isDebugMode } = useDebug();

  const rankedPost = post as Partial<RankedAppPost>;
  const reasons = isDebugMode && Array.isArray(rankedPost.reasons) ? rankedPost.reasons : [];
  const rankingScore =
    isDebugMode && typeof rankedPost.rankingScore === 'number'
      ? rankedPost.rankingScore
      : undefined;
  const isFallbackPost = isDebugMode && rankingScore === undefined && reasons.length === 0;

  const { data: author } = useGetPublicUser(post.authorId);
  const { data: commentsData } = useListComments(post.id);
  const { data: myLikesData } = useGetMyLikes();
  const { data: likersData } = useGetPostLikers(post.id, { limit: 1 });

  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isLikersVisible, setIsLikersVisible] = useState(false);
  const [isDebugDetailVisible, setIsDebugDetailVisible] = useState(false);

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
    cancelAnimation(heartScale);
    cancelAnimation(heartOpacity);
    heartScale.value = 0;
    heartOpacity.value = 1;

    heartScale.value = withSequence(
      withSpring(1, { damping: 12, stiffness: 300, mass: 0.5 }),
      withDelay(
        200,
        withTiming(0, { duration: 150 }, (isFinished) => {
          if (isFinished === true) {
            heartOpacity.value = 0;
            heartScale.value = 0;
          }
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
        likePost.mutate(post.id);
      }
    })
    .runOnJS(true);

  return (
    <View style={styles.card}>
      <PostAuthorHeader
        pseudo={author?.pseudo}
        authorId={post.authorId}
        avatarUrl={resolveAvatarUrl(author)}
        showFollowButton={true}
        onPress={() => {
          navigation.navigate('PublicProfile', { userId: post.authorId });
        }}
      />

      {isDebugMode && (
        <Pressable
          style={styles.debugRankingContainer}
          testID="post-debug-ranking-container"
          onPress={() => {
            setIsDebugDetailVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Afficher les détails de scoring"
        >
          {rankingScore !== undefined && (
            <View style={styles.debugScoreChip}>
              <Text style={styles.debugChipText}>Score: {formatRankingScore(rankingScore)}</Text>
            </View>
          )}
          {reasons.map((reason) => (
            <View key={reason} style={styles.debugReasonChip}>
              <Text style={styles.debugChipText}>{getRankingReasonLabel(reason)}</Text>
            </View>
          ))}
          {isLiked && (
            <View style={styles.debugPenaltyChip}>
              <Text style={styles.debugChipText}>⚠️ ×0.6 (déjà liké)</Text>
            </View>
          )}
          {isFallbackPost && (
            <View style={styles.debugFallbackChip}>
              <Text style={styles.debugChipText}>Repli chronologique (non scoré)</Text>
            </View>
          )}
          <View style={styles.debugDetailsButtonChip}>
            <Text style={styles.debugChipText}>🔍 Détails</Text>
          </View>
        </Pressable>
      )}

      <GestureDetector gesture={doubleTapGesture}>
        <View style={styles.imageWrapper}>
          <PostImage postId={post.id} imageUrl={resolvePostImageUrl(post)} />
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
        commentCount={commentsData?.totalCount ?? commentsData?.comments.length ?? 0}
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
          <Text style={styles.authorPseudo}>{pseudo} </Text>
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

      <RankingDebugDetailModal
        visible={isDebugDetailVisible}
        onClose={() => {
          setIsDebugDetailVisible(false);
        }}
        type="post"
        id={post.id}
        title={post.title}
        rankingScore={rankingScore}
        reasons={reasons}
        isFallback={isFallbackPost}
        isLiked={isLiked}
        authorPseudo={pseudo}
        createdAt={post.createdAt}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background,
    },
    imageWrapper: {
      position: 'relative',
    },
    floatingHeart: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    titleContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
    },
    title: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      fontFamily: theme.typography.fonts.primary,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    description: {
      fontSize: theme.typography.fontSize.sm,
      lineHeight: 20,
      color: theme.colors.text,
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
    debugRankingContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.background,
    },
    debugScoreChip: {
      backgroundColor: theme.colors.warning,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.full,
    },
    debugReasonChip: {
      backgroundColor: theme.colors.blackOverlay,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.full,
    },
    debugChipText: {
      color: theme.colors.white,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      fontFamily: theme.typography.fonts.primary,
    },
    debugFallbackChip: {
      backgroundColor: theme.colors.grey,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.full,
    },
    debugPenaltyChip: {
      backgroundColor: theme.colors.warning,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.full,
    },
    debugDetailsButtonChip: {
      backgroundColor: theme.colors.primarySocio,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.full,
    },
  });
