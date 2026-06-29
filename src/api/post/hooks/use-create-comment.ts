import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '../post.api';
import type { CreateCommentRequest } from '@volontariapp/contracts';
import { COMMENTS_LIST_QUERY_KEY } from './use-list-comments';

export const useCreateComment = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCommentRequest) => postApi.createComment(postId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...COMMENTS_LIST_QUERY_KEY, postId],
      });
    },
  });
};
