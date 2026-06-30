import { useInfiniteQuery } from '@tanstack/react-query';
import { socialApi } from '../social.api';

export const WISHES_QUERY_KEY = ['wishes', 'me'] as const;

/**
 * Hook pour récupérer la liste des IDs d'événements dans les souhaits de l'utilisateur avec pagination.
 */
export const useUserWishes = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: [...WISHES_QUERY_KEY, { limit }],
    queryFn: async ({ pageParam }) => {
      return await socialApi.getMyWishes({ page: pageParam, limit });
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
