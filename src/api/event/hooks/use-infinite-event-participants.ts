import { useInfiniteQuery } from '@tanstack/react-query';
import { eventApi } from '../event.api';

export const EVENT_PARTICIPANTS_PAGE_SIZE = 20;

/**
 * Participants d'un evenement en scroll infini. La cle commence par
 * ['event-participants', eventId] pour rester couverte par les invalidations existantes.
 */
export const useInfiniteEventParticipants = (
  eventId?: string,
  limit: number = EVENT_PARTICIPANTS_PAGE_SIZE,
) => {
  return useInfiniteQuery({
    queryKey: ['event-participants', eventId, 'infinite', limit],
    queryFn: ({ pageParam }) =>
      eventApi.getEventParticipants(eventId ?? '', { page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, page) => acc + page.participants.length, 0);
      return lastPage.participants.length > 0 && loaded < lastPage.totalCount
        ? allPages.length + 1
        : undefined;
    },
    enabled: eventId !== undefined && eventId.length > 0,
  });
};
