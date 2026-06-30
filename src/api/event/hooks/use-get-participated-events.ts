import { useInfiniteQuery } from '@tanstack/react-query';
import { eventApi } from '../event.api';

const PARTICIPATED_EVENTS_QUERY_KEY = ['participated-events'] as const;

export const useGetParticipatedEvents = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: [...PARTICIPATED_EVENTS_QUERY_KEY, { limit }],
    queryFn: async ({ pageParam }) => {
      console.log('[useGetParticipatedEvents] Fetching page:', pageParam, 'with limit:', limit);
      try {
        const result = await eventApi.getParticipatedEvents({ page: pageParam, limit });
        console.log(
          `[useGetParticipatedEvents] Fetched ${String(result.events.length)} events on page ${String(pageParam)}. Total count in DB: ${String(result.totalCount)}`,
        );
        return result;
      } catch (err) {
        console.error('[useGetParticipatedEvents] Erreur de récupération des événements :', err);
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
