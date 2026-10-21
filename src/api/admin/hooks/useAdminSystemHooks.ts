import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminSystemApi, type SeedOptions, type SeedStatusResponse } from '../admin.system.api';

const ADMIN_QUERY_KEY = ['admin'] as const;
const SEED_STATUS_QUERY_KEY = ['admin', 'seed-status'] as const;

export const useSeedDatabaseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options?: SeedOptions) => await adminSystemApi.seedDatabase(options),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: SEED_STATUS_QUERY_KEY });
    },
  });
};

export const useSeedStatusQuery = (options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) => {
  return useQuery<SeedStatusResponse>({
    queryKey: SEED_STATUS_QUERY_KEY,
    queryFn: async () => await adminSystemApi.getSeedStatus(),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? false,
  });
};
