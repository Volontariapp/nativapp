import { useQueries } from '@tanstack/react-query';
import type { LeaderboardEntryWeb } from '@volontariapp/contracts';
import { RANK_PODIUM_SIZE, RANK_SCOPE_PRIORITY } from '@/shared/lib/rank/rank-distinction';
import type { PodiumsByScope } from '@/shared/lib/rank/rank-distinction';
import { leaderboardApi } from '../leaderboard.api';
import { podiumQueryKey } from '../user-query-keys';

/** Un podium change peu : on le garde une minute et on ne le recharge pas au retour au premier plan. */
const PODIUM_STALE_TIME_MS = 60_000;
const NO_ENTRIES: readonly LeaderboardEntryWeb[] = [];

/**
 * Les trois premiers du classement global, du mois et de la semaine. Les trois requêtes sont
 * partagées par tous les cadres de l'écran (même clé, une seule requête réseau). Un échec ne casse
 * rien : le podium est alors vide et aucun cadre n'est posé.
 */
export const usePodiums = (): PodiumsByScope => {
  return useQueries({
    queries: RANK_SCOPE_PRIORITY.map((scope) => ({
      queryKey: podiumQueryKey(scope),
      queryFn: async () => await leaderboardApi.getLeaderboard({ scope, limit: RANK_PODIUM_SIZE }),
      staleTime: PODIUM_STALE_TIME_MS,
      refetchOnWindowFocus: false,
      retry: 1,
    })),
    combine: (results): PodiumsByScope => ({
      global: results[0]?.data?.entries ?? NO_ENTRIES,
      month: results[1]?.data?.entries ?? NO_ENTRIES,
      week: results[2]?.data?.entries ?? NO_ENTRIES,
    }),
  });
};
