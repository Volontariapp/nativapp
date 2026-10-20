import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FlatList } from 'react-native';
import { useRankingFeed } from '@/api/ranking/hooks/use-ranking-feed';
import { useListPosts } from '@/api/post/hooks/use-list-all-posts';
import { rankingApi } from '@/api/ranking/ranking.api';
import type { PostWeb } from '@volontariapp/contracts';

const FEED_PAGE_LIMIT = 10;

export interface UseHomeScreenResult {
  posts: PostWeb[];
  isLoading: boolean;
  isError: boolean;
  isFallbackMode: boolean;
  isRefreshing: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  hasNewContent: boolean;
  flatListRef: React.RefObject<FlatList<PostWeb> | null>;
  handleRefresh: () => Promise<void>;
  handleLoadMore: () => void;
  handleNewPostsPress: () => void;
}

export function useHomeScreen(): UseHomeScreenResult {
  const flatListRef = useRef<FlatList<PostWeb> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasNewContent, setHasNewContent] = useState(false);
  const rankingQuery = useRankingFeed({ limit: FEED_PAGE_LIMIT });
  const isFallbackMode = Boolean(rankingQuery.data?.pages[0]?.isFallback) || rankingQuery.isError;
  const fallbackQuery = useListPosts({ limit: FEED_PAGE_LIMIT });

  const currentListVersionRef = useRef<string | null>(null);

  useEffect(() => {
    const firstPage = rankingQuery.data?.pages[0];
    if (firstPage && !firstPage.isFallback && firstPage.ranking.listVersion) {
      const newVersion = firstPage.ranking.listVersion;
      if (currentListVersionRef.current != null && currentListVersionRef.current !== newVersion) {
        setHasNewContent(true);
      }
      currentListVersionRef.current = newVersion;
    }

    const last = rankingQuery.data?.pages[rankingQuery.data.pages.length - 1];
    if (last && !last.isFallback && last.ranking.versionChanged) {
      setHasNewContent(true);
    }
  }, [rankingQuery.data]);

  // 5. Flattening des posts selon le mode
  const posts = useMemo((): PostWeb[] => {
    if (!isFallbackMode) {
      return rankingQuery.data?.pages.flatMap((page) => (page.isFallback ? [] : page.posts)) ?? [];
    }
    return fallbackQuery.data?.pages.flatMap((page) => page.posts) ?? [];
  }, [isFallbackMode, rankingQuery.data, fallbackQuery.data]);

  const isLoading = isFallbackMode ? fallbackQuery.isLoading : rankingQuery.isLoading;
  const isError = isFallbackMode ? fallbackQuery.isError : false;
  const hasNextPage = isFallbackMode ? fallbackQuery.hasNextPage : rankingQuery.hasNextPage;
  const isFetchingNextPage = isFallbackMode
    ? fallbackQuery.isFetchingNextPage
    : rankingQuery.isFetchingNextPage;

  // 6. Rafraîchissement manuel (Pull-to-refresh)
  const handleRefresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    setHasNewContent(false);
    try {
      try {
        await rankingApi.requestRefresh('POST');
      } catch (err) {
        console.warn('[useHomeScreen] requestRefresh POST failed or throttled:', err);
      }
      await Promise.all([
        rankingQuery.refetch(),
        isFallbackMode ? fallbackQuery.refetch() : Promise.resolve(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [isFallbackMode, rankingQuery, fallbackQuery]);

  const handleLoadMore = useCallback((): void => {
    if (hasNextPage && !isFetchingNextPage) {
      if (isFallbackMode) {
        void fallbackQuery.fetchNextPage();
      } else {
        void rankingQuery.fetchNextPage();
      }
    }
  }, [hasNextPage, isFetchingNextPage, isFallbackMode, fallbackQuery, rankingQuery]);

  const handleNewPostsPress = useCallback((): void => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    void handleRefresh();
  }, [handleRefresh]);

  return {
    posts,
    isLoading,
    isError,
    isFallbackMode,
    isRefreshing,
    hasNextPage,
    isFetchingNextPage,
    hasNewContent,
    flatListRef,
    handleRefresh,
    handleLoadMore,
    handleNewPostsPress,
  };
}
