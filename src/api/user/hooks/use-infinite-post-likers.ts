import { useInfiniteQuery } from '@tanstack/react-query';
import { userApi } from '../user.api';

export const POST_LIKERS_PAGE_SIZE = 20;

/**
 * Liste paginee (scroll infini) des utilisateurs ayant like un post.
 * La cle commence par ['post-likers', postId] pour rester couverte par les
 * invalidations existantes (like, unlike, notifications temps reel).
 */
export const useInfinitePostLikers = (postId: string, limit: number = POST_LIKERS_PAGE_SIZE) => {
  return useInfiniteQuery({
    queryKey: ['post-likers', postId, 'infinite', limit],
    queryFn: ({ pageParam }) => userApi.getPostLikers(postId, { page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, page) => acc + page.users.length, 0);
      return lastPage.users.length > 0 && loaded < lastPage.totalCount
        ? allPages.length + 1
        : undefined;
    },
    enabled: !!postId,
  });
};
