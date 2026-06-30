import { Alert } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { postApi } from '../post.api';
import { useAuth } from '@/context/AuthContext';

export const MY_POSTS_QUERY_KEY = ['my-posts'] as const;

export const useGetMyPosts = (limit = 10) => {
  const { userId } = useAuth();

  return useInfiniteQuery({
    queryKey: [...MY_POSTS_QUERY_KEY, userId, { limit }],
    queryFn: async ({ pageParam }) => {
      if (userId === null) throw new Error('Not authenticated');
      console.log('[useGetMyPosts] Fetching page:', pageParam, 'with limit:', limit);
      try {
        const result = await postApi.getMyPosts({ page: pageParam, limit, authorId: userId });
        console.log(
          `[useGetMyPosts] Fetched ${String(result.posts.length)} posts on page ${String(pageParam)}. Total count: ${String(result.totalCount)}`,
        );
        return result;
      } catch (err) {
        console.error(
          '[useGetMyPosts] Erreur de récupération des posts :',
          err instanceof Error ? err.message : String(err),
        );
        Alert.alert('Erreur', err instanceof Error ? err.message : String(err));
        return {
          posts: [],
          pagination: { page: pageParam, limit, total: 0, totalPages: 0 },
          totalCount: 0,
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentCount = allPages.reduce((acc, page) => acc + page.posts.length, 0);
      if (currentCount < lastPage.totalCount) {
        return allPages.length + 1;
      }
      return undefined;
    },
    enabled: userId !== null,
  });
};
