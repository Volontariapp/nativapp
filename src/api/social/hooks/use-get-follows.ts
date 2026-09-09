import { useQuery } from '@tanstack/react-query';
import { socialApi } from '../social.api';

export const FOLLOWS_QUERY_KEY = ['follows'];

export const useGetFollows = (
  userId: string,
  params?: { page?: number; limit?: number },
  enabled = true,
) => {
  return useQuery({
    queryKey: [...FOLLOWS_QUERY_KEY, userId, params],
    queryFn: () => socialApi.getFollows(userId, params),
    enabled,
  });
};
