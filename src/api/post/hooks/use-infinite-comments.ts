import { useInfiniteQuery } from '@tanstack/react-query';
import { postApi } from '../post.api';
import { COMMENTS_LIST_QUERY_KEY } from '../comments-query-keys';

export const COMMENTS_PAGE_SIZE = 10;

/**
 * Liste paginee (scroll infini) des commentaires d'un post.
 * La cle commence par [...COMMENTS_LIST_QUERY_KEY, postId] pour rester couverte
 * par les invalidations existantes (mutations et notifications temps reel).
 */
export function useInfiniteComments(postId: string, limit: number = COMMENTS_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: [...COMMENTS_LIST_QUERY_KEY, postId, 'infinite', limit],
    queryFn: ({ pageParam }) => postApi.listComments(postId, { page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const current = lastPage.page;
      return current < lastPage.totalPages ? current + 1 : undefined;
    },
    enabled: !!postId,
  });
}
