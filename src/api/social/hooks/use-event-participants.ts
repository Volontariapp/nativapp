import { useInfiniteQuery } from '@tanstack/react-query';
import { socialApi } from '../social.api';

export const EVENT_PARTICIPANTS_QUERY_KEY = ['event-participants'] as const;

/**
 * Hook pour récupérer la liste des participants d'un événement avec pagination.
 */
export const useEventParticipants = (eventId: string, limit = 10) => {
  return useInfiniteQuery({
    queryKey: [...EVENT_PARTICIPANTS_QUERY_KEY, eventId, { limit }],
    queryFn: async ({ pageParam }) => {
      return await socialApi.getEventParticipants(eventId, { page: pageParam, limit });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentCount = allPages.reduce((acc, page) => acc + page.ids.length, 0);
      if (currentCount < lastPage.totalCount) {
        return allPages.length + 1;
      }
      return undefined;
    },
    enabled: !!eventId,
  });
};
