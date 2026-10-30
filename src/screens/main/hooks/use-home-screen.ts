import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FlatList } from 'react-native';
import type { InfiniteData } from '@tanstack/react-query';
import { useRankingFeed } from '@/api/ranking/hooks/use-ranking-feed';
import { useListPosts } from '@/api/post/hooks/use-list-all-posts';
import { useEngagedPostIds } from '@/api/post/hooks/use-engaged-post-ids';
import { useGetMyLikes } from '@/api/social/hooks/use-get-my-likes';
import { rankingApi, type RankingFeedResult } from '@/api/ranking/ranking.api';
import { useAuth } from '@/context/auth/auth.context';
import type { PostWeb } from '@volontariapp/contracts';
import {
  applyPinnedOrder,
  unseenFirst,
  withoutHandledPosts,
} from '../helpers/feed-visibility.helpers';

const FEED_PAGE_LIMIT = 10;

export interface UseHomeScreenResult {
  posts: PostWeb[];
  isLoading: boolean;
  isError: boolean;
  isFallbackMode: boolean;
  isRefreshing: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  flatListRef: React.RefObject<FlatList<PostWeb> | null>;
  handleRefresh: () => Promise<void>;
  handleLoadMore: () => void;
}

const rankedPostsOf = (data: InfiniteData<RankingFeedResult> | undefined): PostWeb[] =>
  data?.pages.flatMap((page) => (page.isFallback ? [] : page.posts)) ?? [];

const fallbackPostsOf = (data: InfiniteData<{ posts: PostWeb[] }> | undefined): PostWeb[] =>
  data?.pages.flatMap((page) => page.posts) ?? [];

export function useHomeScreen(): UseHomeScreenResult {
  const flatListRef = useRef<FlatList<PostWeb> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { userId } = useAuth();
  const myLikes = useGetMyLikes();
  const engagedPostIds = useEngagedPostIds();
  // Photo des posts a ne plus proposer, prise au chargement puis a chaque refresh : un post que
  // l'on like sous ses yeux reste affiche jusqu'au prochain refresh au lieu de disparaitre.
  const [handledIds, setHandledIds] = useState<ReadonlySet<string>>(new Set());
  // Ordre fige au dernier refresh : les posts jamais affiches d'abord.
  const [pinnedOrder, setPinnedOrder] = useState<readonly string[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const hasHandledSnapshotRef = useRef(false);
  const rankingQuery = useRankingFeed({ limit: FEED_PAGE_LIMIT });
  const firstPage = rankingQuery.data?.pages[0];
  const hasRankedPosts = Boolean(firstPage && !firstPage.isFallback && firstPage.posts.length > 0);
  const isFallbackMode =
    Boolean(firstPage?.isFallback) ||
    rankingQuery.isError ||
    (rankingQuery.isSuccess && !hasRankedPosts);
  const fallbackQuery = useListPosts({ limit: FEED_PAGE_LIMIT });

  useEffect(() => {
    if (hasHandledSnapshotRef.current || !myLikes.data) {
      return;
    }
    hasHandledSnapshotRef.current = true;
    setHandledIds(new Set([...myLikes.data.ids, ...engagedPostIds]));
  }, [myLikes.data, engagedPostIds]);

  // Flattening des posts selon le mode, sans les posts de l'utilisateur ni ceux deja likes ou commentes
  const posts = useMemo((): PostWeb[] => {
    const candidates = isFallbackMode
      ? fallbackPostsOf(fallbackQuery.data)
      : rankedPostsOf(rankingQuery.data);
    return applyPinnedOrder(withoutHandledPosts(candidates, handledIds, userId), pinnedOrder);
  }, [isFallbackMode, rankingQuery.data, fallbackQuery.data, handledIds, userId, pinnedOrder]);

  const isLoading = isFallbackMode
    ? fallbackQuery.isLoading
    : rankingQuery.isLoading || (!hasRankedPosts && fallbackQuery.isLoading);
  const isError = isFallbackMode ? fallbackQuery.isError : false;
  const hasNextPage = isFallbackMode ? fallbackQuery.hasNextPage : rankingQuery.hasNextPage;
  const isFetchingNextPage = isFallbackMode
    ? fallbackQuery.isFetchingNextPage
    : rankingQuery.isFetchingNextPage;

  // Rafraîchissement manuel (Pull-to-refresh)
  const handleRefresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      posts.forEach((post) => seenIdsRef.current.add(post.id));
      try {
        await rankingApi.requestRefresh('POST');
      } catch (err) {
        console.warn('[useHomeScreen] requestRefresh POST failed or throttled:', err);
      }
      const [likesResult, rankingResult, fallbackResult] = await Promise.all([
        myLikes.refetch(),
        rankingQuery.refetch(),
        isFallbackMode ? fallbackQuery.refetch() : Promise.resolve(undefined),
      ]);
      const nextHandledIds = new Set([...(likesResult.data?.ids ?? []), ...engagedPostIds]);
      const keepNew = (candidates: PostWeb[]): PostWeb[] =>
        withoutHandledPosts(candidates, nextHandledIds, userId);

      let visible = keepNew(
        isFallbackMode ? fallbackPostsOf(fallbackResult?.data) : rankedPostsOf(rankingResult.data),
      );
      // Le worker n'a rien recalcule : on va chercher la suite de la liste plutot que de rejouer les memes posts.
      const hasUnseen = visible.some((post) => !seenIdsRef.current.has(post.id));
      if (!isFallbackMode && !hasUnseen && rankingQuery.hasNextPage) {
        const more = await rankingQuery.fetchNextPage();
        visible = keepNew(rankedPostsOf(more.data));
      }

      setHandledIds(nextHandledIds);
      setPinnedOrder(unseenFirst(visible, seenIdsRef.current).map((post) => post.id));
    } finally {
      setIsRefreshing(false);
    }
  }, [posts, isFallbackMode, rankingQuery, fallbackQuery, myLikes, engagedPostIds, userId]);

  const handleLoadMore = useCallback((): void => {
    if (hasNextPage && !isFetchingNextPage) {
      if (isFallbackMode) {
        void fallbackQuery.fetchNextPage();
      } else {
        void rankingQuery.fetchNextPage();
      }
    }
  }, [hasNextPage, isFetchingNextPage, isFallbackMode, fallbackQuery, rankingQuery]);

  return {
    posts,
    isLoading,
    isError,
    isFallbackMode,
    isRefreshing,
    hasNextPage,
    isFetchingNextPage,
    flatListRef,
    handleRefresh,
    handleLoadMore,
  };
}
