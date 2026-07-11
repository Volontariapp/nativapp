import { useQuery } from '@tanstack/react-query';
import { userApi, type UserPublicProfile } from '../user.api';

const PROFILE_QUERY_KEY = ['profile'] as const;

export const useGetPublicUser = (userId?: string) => {
  return useQuery<UserPublicProfile | null>({
    queryKey: [...PROFILE_QUERY_KEY, userId],
    queryFn: async () => {
      if (userId == null) return null;
      return await userApi.getPublicUser(userId);
    },
    enabled: !(userId == null),
  });
};
