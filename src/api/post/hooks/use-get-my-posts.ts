import { useInfiniteQuery } from '@tanstack/react-query';
import { postApi } from '../post.api';
import { useAuth } from '@/context/AuthContext';

export const MY_POSTS_QUERY_KEY = ['my-posts'] as const;

/**
 * Taille de page unique pour "mes posts" : tous les ecrans partagent ainsi le meme cache.
 * 12 = 4 rangees de la grille a 3 colonnes.
 */
export const MY_POSTS_PAGE_SIZE = 12;

export const useGetMyPosts = () => {
  const { userId } = useAuth();

  return useInfiniteQuery({
    queryKey: [...MY_POSTS_QUERY_KEY, userId, { limit: MY_POSTS_PAGE_SIZE }],
    queryFn: ({ pageParam }) => {
      if (userId === null) throw new Error('Not authenticated');
      // L'erreur remonte a react-query (isError) : une page vide ne doit pas passer pour la fin de liste.
      return postApi.getMyPosts({ page: pageParam, limit: MY_POSTS_PAGE_SIZE, authorId: userId });
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
