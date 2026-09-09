import { useQuery } from '@tanstack/react-query';
import { socialApi } from '../social.api';

export const FOLLOWERS_QUERY_KEY = ['followers'];

export const useGetFollowers = (
  userId: string,
  params?: { page?: number; limit?: number },
  enabled = true,
) => {
  return useQuery({
    queryKey: [...FOLLOWERS_QUERY_KEY, userId, params],
    queryFn: () => socialApi.getFollowers(userId, params),
    enabled,
  });
};
