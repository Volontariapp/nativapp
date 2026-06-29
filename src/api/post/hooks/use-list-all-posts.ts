import { useInfiniteQuery } from '@tanstack/react-query';
import { postApi } from '../post.api';

export const POSTS_LIST_QUERY_KEY = ['posts-list'] as const;

export function useListPosts(
  params: {
    authorId?: string;
    limit?: number;
  } = {},
) {
  const limit = params.limit ?? 10;

  return useInfiniteQuery({
    queryKey: [POSTS_LIST_QUERY_KEY, params],
    queryFn: ({ pageParam }) => postApi.listPosts({ ...params, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.posts.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    },
  });
}
