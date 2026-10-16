import { useQuery } from '@tanstack/react-query';
import { eventApi, type AppEvent } from '../event.api';

export const useGetEvent = (id?: string) => {
  return useQuery<AppEvent | null>({
    queryKey: ['event', id],
    queryFn: async () => {
      if (id === undefined || id.length === 0) return null;
      return await eventApi.getEvent(id);
    },
    enabled: id !== undefined && id.length > 0,
  });
};
