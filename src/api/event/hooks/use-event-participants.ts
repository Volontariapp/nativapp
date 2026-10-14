import { useQuery } from '@tanstack/react-query';
import { eventApi, type EventParticipant } from '../event.api';

interface UseEventParticipantsParams {
  page?: number;
  limit?: number;
}

export const useEventParticipants = (
  eventId?: string,
  params?: UseEventParticipantsParams,
) => {
  return useQuery<{ participants: EventParticipant[]; totalCount: number }>({
    queryKey: ['event-participants', eventId, params?.page, params?.limit],
    queryFn: async () => {
      if (eventId === undefined || eventId.length === 0) {
        return { participants: [], totalCount: 0 };
      }
      return await eventApi.getEventParticipants(eventId, params);
    },
    enabled: eventId !== undefined && eventId.length > 0,
  });
};
