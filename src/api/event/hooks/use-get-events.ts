import { useInfiniteQuery } from '@tanstack/react-query';
import { eventApi } from '../event.api';
import type { SearchEventsRequest } from '@volontariapp/contracts';

const EVENTS_QUERY_KEY = ['events'] as const;

export const useGetEvents = (params?: Partial<SearchEventsRequest>) => {
  return useInfiniteQuery({
    queryKey: [...EVENTS_QUERY_KEY, params],
    queryFn: async ({ pageParam }) => {
      console.log('[useGetEvents] Fetching page:', pageParam, 'with params:', params);
      try {
        const result = await eventApi.getEvents({ page: pageParam, ...params });
        console.log(
          `[useGetEvents] Fetched ${String(result.events.length)} events on page ${String(pageParam)}. Total count in DB: ${String(result.totalCount)}`,
        );
        return result;
      } catch (err) {
        console.error('[useGetEvents] Erreur de récupération des événements :', err);
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
