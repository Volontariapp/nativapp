import { useQuery } from '@tanstack/react-query';
import { postApi } from '../post.api';

export const POSTS_LIST_QUERY_KEY = ['posts-list'] as const;

export function useListPosts(params: {
  authorId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [POSTS_LIST_QUERY_KEY, params],
    queryFn: () => postApi.listPosts(params),
  });
}
