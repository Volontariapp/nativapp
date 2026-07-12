import { useQuery } from '@tanstack/react-query';
import { userApi } from '../user.api';

export const useGetPostLikers = (postId: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['post-likers', postId, params],
    queryFn: () => userApi.getPostLikers(postId, params),
    enabled: !!postId,
  });
};
