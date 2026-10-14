import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi, type AppEvent } from '../event.api';
import type { EventState } from '@volontariapp/contracts';

interface ChangeEventStateVariables {
  id: string;
  newState: EventState;
}

export const useChangeEventState = () => {
  const queryClient = useQueryClient();

  return useMutation<AppEvent | null, Error, ChangeEventStateVariables>({
    mutationFn: async ({ id, newState }: ChangeEventStateVariables) => {
      return await eventApi.changeEventState(id, newState);
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
