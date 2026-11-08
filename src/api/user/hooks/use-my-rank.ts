import { useQuery } from '@tanstack/react-query';
import type { GetMyRankWebResponse, LeaderboardScopeWeb } from '@volontariapp/contracts';
import { leaderboardApi } from '../leaderboard.api';
import { myRankQueryKey } from '../user-query-keys';

/** Mon rang et mes voisins sur un classement. `me` est absent tant que je n'ai pas de points. */
export const useMyRank = (scope: LeaderboardScopeWeb) => {
  return useQuery<GetMyRankWebResponse>({
    queryKey: myRankQueryKey(scope),
    queryFn: async () => await leaderboardApi.getMyRank(scope),
    staleTime: 60_000,
  });
};
