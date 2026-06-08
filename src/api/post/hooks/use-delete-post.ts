import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '../post.api';
import { MY_POSTS_QUERY_KEY } from './use-get-my-posts';
import { useAuth } from '@/context/AuthContext';

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: (id: string) => postApi.deletePost(id),
    onSuccess: () => {
      if (userId !== null) {
        void queryClient.invalidateQueries({
          queryKey: [...MY_POSTS_QUERY_KEY, userId],
        });
      }
    },
  });
};
