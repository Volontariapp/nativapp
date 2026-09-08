import { useQuery } from '@tanstack/react-query';
import { socialApi } from '../social.api';

export const GET_IS_FOLLOWING_QUERY_KEY = ['is-following'];

export const useGetIsFollowing = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: [...GET_IS_FOLLOWING_QUERY_KEY, userId],
    queryFn: () => socialApi.getIsFollowing(userId),
    enabled,
  });
};
