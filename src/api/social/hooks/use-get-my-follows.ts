import { useQuery } from '@tanstack/react-query';
import { socialApi } from '../social.api';

export const MY_FOLLOWS_QUERY_KEY = ['my-follows'];

export const useGetMyFollows = (params?: { page?: number; limit?: number }, enabled = true) => {
  return useQuery({
    queryKey: [...MY_FOLLOWS_QUERY_KEY, params],
    queryFn: () => socialApi.getMyFollows(params),
    enabled,
  });
};
