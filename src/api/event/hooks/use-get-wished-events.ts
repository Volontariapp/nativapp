import { useInfiniteQuery } from '@tanstack/react-query';
import { eventApi } from '../event.api';

const WISHED_EVENTS_QUERY_KEY = ['wished-events'] as const;

export const useGetWishedEvents = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: WISHED_EVENTS_QUERY_KEY,
    queryFn: async ({ pageParam }) => {
      console.log('[useGetWishedEvents] Fetching page:', pageParam, 'with limit:', limit);
      try {
        const result = await eventApi.getWishedEvents({ page: pageParam, limit });
        console.log(
          `[useGetWishedEvents] Fetched ${String(result.events.length)} events on page ${String(pageParam)}. Total count in DB: ${String(result.totalCount)}`,
        );
        return result;
      } catch (err) {
        console.error('[useGetWishedEvents] Erreur de récupération des événements :', err);
        throw err;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentCount = allPages.reduce((acc, page) => acc + page.events.length, 0);
      if (currentCount < lastPage.totalCount) {
        return allPages.length + 1;
      }
      return undefined;
    },
  });
};
