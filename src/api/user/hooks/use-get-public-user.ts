import { useQuery } from '@tanstack/react-query';
import { userApi, type UserPublicProfile } from '../user.api';
import { publicProfileQueryKey } from '../user-query-keys';

export const useGetPublicUser = (userId?: string) => {
  return useQuery<UserPublicProfile | null>({
    queryKey: publicProfileQueryKey(userId),
    queryFn: async () => {
      if (userId == null) return null;
      return await userApi.getPublicUser(userId);
    },
    enabled: !(userId == null),
  });
};
