import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi, type AppEvent } from '../event.api';
import type { UpdateEventRequest } from '@volontariapp/contracts';

interface UpdateEventVariables {
  id: string;
  payload: Partial<UpdateEventRequest>;
}

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<AppEvent | null, Error, UpdateEventVariables>({
    mutationFn: async ({ id, payload }: UpdateEventVariables) => {
      return await eventApi.updateEvent(id, payload);
    },
    onSuccess: (updatedEvent, variables) => {
      if (updatedEvent) {
        queryClient.setQueryData(['event', variables.id], updatedEvent);
      }
      void queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
      void queryClient.invalidateQueries({ queryKey: ['events'] });
      void queryClient.invalidateQueries({ queryKey: ['my-events'] });
    },
  });
};
