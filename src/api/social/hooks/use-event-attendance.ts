import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GetEventAttendeesResponse } from '@volontariapp/contracts';
import { socialApi } from '../social.api';

export const useEventAttendees = (eventId?: string, params?: { page?: number; limit?: number }) => {
  return useQuery<GetEventAttendeesResponse>({
    queryKey: ['event-attendees', eventId, params?.page, params?.limit],
    queryFn: async () => {
      if (eventId === undefined || eventId.length === 0) {
        return { attendees: [], pagination: undefined };
      }
      return await socialApi.getEventAttendees(eventId, params);
    },
    enabled: eventId !== undefined && eventId.length > 0,
  });
};

export const useSetEventAttendance = (eventId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { checkedUserIds: string[]; uncheckedUserIds?: string[] }) => {
      if (eventId === undefined || eventId.length === 0) {
        throw new Error('Event ID is required to set attendance');
      }
      return await socialApi.setEventAttendance(eventId, payload);
    },
    onSuccess: async () => {
      if (eventId !== undefined && eventId.length > 0) {
        await queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] });
        await queryClient.invalidateQueries({ queryKey: ['event-participants', eventId] });
      }
    },
  });
};
