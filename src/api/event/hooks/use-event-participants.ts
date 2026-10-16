import { useQuery } from '@tanstack/react-query';
import type { UserWeb } from '@volontariapp/contracts';
import { eventApi } from '../event.api';

interface UseEventParticipantsParams {
  page?: number;
  limit?: number;
}

export const useEventParticipants = (
  eventId?: string,
  params?: UseEventParticipantsParams,
) => {
  return useQuery<{ participants: UserWeb[]; totalCount: number }>({
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
