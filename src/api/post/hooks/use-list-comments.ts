import { useQuery } from '@tanstack/react-query';
import { postApi } from '../post.api';

export const COMMENTS_LIST_QUERY_KEY = ['comments-list'] as const;

export function useListComments(
  postId: string,
  params: { page?: number; limit?: number } = { limit: 10, page: 1 },
) {
  return useQuery({
    queryKey: [...COMMENTS_LIST_QUERY_KEY, postId, params],
    queryFn: () => postApi.listComments(postId, params),
    enabled: !!postId,
  });
}
