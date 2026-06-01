import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSocialApi } from '../admin.social.api';
import type { ActionSuccessWebResponse } from '@volontariapp/contracts';

interface ParticipateParams {
  userId: string;
  eventId: string;
}

export function useAdminParticipateEvent() {
  const queryClient = useQueryClient();

  return useMutation<ActionSuccessWebResponse, Error, ParticipateParams>({
    mutationFn: ({ userId, eventId }) =>
      adminSocialApi.participate({
        userId,
        eventId,
      }),
    onSuccess: (_, { eventId }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-event-participants', eventId] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}
