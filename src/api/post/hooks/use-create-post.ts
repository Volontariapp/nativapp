import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '../post.api';
import type { CreatePostRequest } from '@volontariapp/contracts';
import { MY_POSTS_QUERY_KEY } from './use-get-my-posts';
import { useAuth } from '@/context/AuthContext';

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: (payload: CreatePostRequest) => postApi.createPost(payload),
    onSuccess: () => {
      if (userId != null) {
        void queryClient.invalidateQueries({
          queryKey: [...MY_POSTS_QUERY_KEY, userId],
        });
      }
    },
  });
};
