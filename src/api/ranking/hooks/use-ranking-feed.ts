import { useInfiniteQuery } from '@tanstack/react-query';
import { rankingApi, type RankingFeedResult } from '../ranking.api';

export const RANKING_FEED_QUERY_KEY = ['ranking', 'feed'] as const;

export interface UseRankingFeedOptions {
  limit?: number;
  enabled?: boolean;
}

export const useRankingFeed = (options?: UseRankingFeedOptions) => {
  return useInfiniteQuery<RankingFeedResult>({
    queryKey: [...RANKING_FEED_QUERY_KEY, options?.limit],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'string' && pageParam.length > 0 ? pageParam : undefined;
      return rankingApi.getFeed({
        cursor,
        limit: options?.limit,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: RankingFeedResult | undefined) => {
      if (lastPage == null || lastPage.isFallback) {
        return undefined;
      }
      if (lastPage.ranking.hasMore && Boolean(lastPage.ranking.nextCursor)) {
        return lastPage.ranking.nextCursor;
      }
      return undefined;
    },
    enabled: options?.enabled ?? true,
  });
};
