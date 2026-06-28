import { useInfiniteQuery } from '@tanstack/react-query';
import { socialApi } from '../social.api';

export const PARTICIPATIONS_QUERY_KEY = ['participations', 'me'] as const;

/**
 * Hook pour récupérer les événements auxquels l'utilisateur participe avec pagination.
 */
export const useUserParticipations = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: PARTICIPATIONS_QUERY_KEY,
    queryFn: async ({ pageParam }) => {
      return await socialApi.getMyParticipations({ page: pageParam, limit });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentCount = allPages.reduce((acc, page) => acc + page.ids.length, 0);
      if (currentCount < lastPage.totalCount) {
        return allPages.length + 1;
      }
      return undefined;
    },
  });
};
