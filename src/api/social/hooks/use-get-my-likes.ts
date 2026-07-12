import { useQuery } from '@tanstack/react-query';
import { socialApi } from '../social.api';

export const useGetMyLikes = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['my-likes', params],
    queryFn: () => socialApi.getMyLikes(params),
  });
};
