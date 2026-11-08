import { useInfiniteQuery } from '@tanstack/react-query';
import type { LeaderboardScopeWeb } from '@volontariapp/contracts';
import { leaderboardApi } from '../leaderboard.api';
import { leaderboardListQueryKey } from '../user-query-keys';

export const LEADERBOARD_PAGE_SIZE = 20;

/** Classement complet en scroll infini, par curseur : on repasse `nextCursor` tel quel. */
export const useInfiniteLeaderboard = (scope: LeaderboardScopeWeb) => {
  return useInfiniteQuery({
    queryKey: leaderboardListQueryKey(scope),
    queryFn: async ({ pageParam }) =>
      await leaderboardApi.getLeaderboard({
        scope,
        cursor: pageParam,
        limit: LEADERBOARD_PAGE_SIZE,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};
