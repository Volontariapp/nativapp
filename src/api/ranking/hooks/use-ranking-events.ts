import { useInfiniteQuery } from '@tanstack/react-query';
import { rankingApi, type RankingEventsResult } from '../ranking.api';

export const RANKING_EVENTS_QUERY_KEY = ['ranking', 'events'] as const;

export interface UseRankingEventsOptions {
  limit?: number;
  enabled?: boolean;
}

export const useRankingEvents = (options?: UseRankingEventsOptions) => {
  return useInfiniteQuery<RankingEventsResult>({
    queryKey: [...RANKING_EVENTS_QUERY_KEY, options?.limit],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'string' && pageParam.length > 0 ? pageParam : undefined;
      return rankingApi.getEvents({
        cursor,
        limit: options?.limit,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: RankingEventsResult | undefined) => {
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
