import { useInfiniteQuery } from '@tanstack/react-query';
import { postApi } from '../post.api';

const MY_POSTS_QUERY_KEY = ['my-posts'] as const;

export const useGetMyPosts = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: MY_POSTS_QUERY_KEY,
    queryFn: async ({ pageParam }) => {
      console.log('[useGetMyPosts] Fetching page:', pageParam, 'with limit:', limit);
      try {
        const result = await postApi.getMyPosts({ page: pageParam, limit });
        console.log(
          `[useGetMyPosts] Fetched ${String(result.postIds.length)} post IDs on page ${String(pageParam)}.`,
        );
        return result;
      } catch (err) {
        console.error('[useGetMyPosts] Erreur de récupération des posts :', err);
        throw err;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Si on a récupéré moins que la limite, c'est qu'il n'y a plus de pages
      if (lastPage.postIds.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    },
  });
};
