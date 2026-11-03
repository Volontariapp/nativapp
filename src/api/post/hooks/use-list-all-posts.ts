import { useInfiniteQuery } from '@tanstack/react-query';
import { postApi } from '../post.api';

export const POSTS_LIST_QUERY_KEY = ['posts-list'] as const;

export function useListPosts(
  params: {
    authorId?: string;
    limit?: number;
    /** Faux : la requete ne part pas (ex. repli du fil Home tant que le ranking suffit). */
    enabled?: boolean;
  } = {},
) {
  const { enabled = true, ...queryParams } = params;
  const limit = queryParams.limit ?? 10;

  return useInfiniteQuery({
    queryKey: [POSTS_LIST_QUERY_KEY, queryParams],
    queryFn: ({ pageParam }) => postApi.listPosts({ ...queryParams, page: pageParam, limit }),
    enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.posts.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    },
  });
}
