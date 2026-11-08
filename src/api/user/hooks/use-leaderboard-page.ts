import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { GetLeaderboardWebResponse, LeaderboardScopeWeb } from '@volontariapp/contracts';
import { leaderboardApi } from '../leaderboard.api';
import { leaderboardListQueryKey } from '../user-query-keys';

/** Taille d'une page du classement : assez courte pour s'afficher d'un coup, sans défilement infini. */
export const LEADERBOARD_PAGE_SIZE = 10;

/**
 * Une page du classement. La page précédente reste affichée pendant le chargement de la suivante,
 * ce qui évite un écran vide à chaque changement de page.
 */
export const useLeaderboardPage = (scope: LeaderboardScopeWeb, cursor: string | undefined) => {
  return useQuery<GetLeaderboardWebResponse>({
    queryKey: [...leaderboardListQueryKey(scope), cursor ?? 'first'],
    queryFn: async () =>
      await leaderboardApi.getLeaderboard({ scope, cursor, limit: LEADERBOARD_PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });
};
