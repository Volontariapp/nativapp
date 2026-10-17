import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSystemApi } from '../admin.system.api';

const ADMIN_QUERY_KEY = ['admin'] as const;

export const useSeedDatabaseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => await adminSystemApi.seedDatabase(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEY });
    },
  });
};
