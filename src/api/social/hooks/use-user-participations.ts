import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { socialApi } from '../social.api';

export const PARTICIPATIONS_QUERY_KEY = ['participations', 'me'] as const;

/** Garde-fou : nombre maximal de pages chargees automatiquement. */
export const PARTICIPATIONS_MAX_AUTO_PAGES = 20;

/**
 * Hook pour récupérer les événements auxquels l'utilisateur participe avec pagination.
 * Avec `autoFetchAll`, les pages suivantes sont chargees automatiquement (limit <= 100).
 */
export const useUserParticipations = (limit = 10, options?: { autoFetchAll?: boolean }) => {
  const query = useInfiniteQuery({
    queryKey: [...PARTICIPATIONS_QUERY_KEY, { limit }],
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

  const autoFetchAll = options?.autoFetchAll === true;
  const { hasNextPage, isFetchingNextPage, isError, fetchNextPage } = query;
  const loadedPages = query.data?.pages.length ?? 0;
  useEffect(() => {
    if (
      autoFetchAll &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isError &&
      loadedPages < PARTICIPATIONS_MAX_AUTO_PAGES
    ) {
      void fetchNextPage();
    }
  }, [autoFetchAll, hasNextPage, isFetchingNextPage, isError, loadedPages, fetchNextPage]);

  return query;
};
