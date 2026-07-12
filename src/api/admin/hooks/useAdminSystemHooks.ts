import { useMutation } from '@tanstack/react-query';
import { adminSystemApi } from '../admin.system.api';

export const useSeedDatabaseMutation = () => {
  return useMutation({
    mutationFn: async () => await adminSystemApi.seedDatabase(),
  });
};
