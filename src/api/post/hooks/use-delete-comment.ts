import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '../post.api';
import { COMMENTS_LIST_QUERY_KEY } from './use-list-comments';

export const useDeleteComment = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => postApi.deleteComment(postId, commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...COMMENTS_LIST_QUERY_KEY, postId],
      });
    },
  });
};
