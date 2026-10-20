import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RankingListKindWeb, RequestRankingRefreshWebResponse } from '@volontariapp/contracts';
import { rankingApi } from '../ranking.api';
import { RANKING_EVENTS_QUERY_KEY } from './use-ranking-events';

export interface RequestRankingRefreshVariables {
  listKind: RankingListKindWeb;
}

export const useRequestRankingRefresh = () => {
  const queryClient = useQueryClient();

  return useMutation<RequestRankingRefreshWebResponse, Error, RequestRankingRefreshVariables>({
    mutationFn: async ({ listKind }: RequestRankingRefreshVariables) => {
      return rankingApi.requestRefresh(listKind);
    },
    onSuccess: (data, variables) => {
      // Invalidation uniquement si le recalcul a été déclenché ou pour resynchroniser
      if (!data.refreshThrottled) {
        if (variables.listKind === 'EVENT') {
          void queryClient.invalidateQueries({ queryKey: RANKING_EVENTS_QUERY_KEY });
        } else {
          void queryClient.invalidateQueries({ queryKey: ['ranking', 'feed'] });
        }
      }
    },
  });
};
