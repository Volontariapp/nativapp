import { useQuery, type QueryClient } from '@tanstack/react-query';

export const ENGAGED_POST_IDS_QUERY_KEY = ['feed', 'engaged-post-ids'] as const;

const NO_POST_IDS: readonly string[] = [];

/**
 * Posts commentes pendant la session. Aucune liste de ses commentaires n'est lue cote serveur : le
 * feed s'en sert pour ne pas reproposer un post deja commente. Les likes viennent de `useGetMyLikes`.
 */
export const useEngagedPostIds = (): readonly string[] => {
  const { data } = useQuery<readonly string[]>({
    queryKey: ENGAGED_POST_IDS_QUERY_KEY,
    queryFn: () => NO_POST_IDS,
    initialData: NO_POST_IDS,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return data;
};

export const markPostEngaged = (queryClient: QueryClient, postId: string): void => {
  queryClient.setQueryData<readonly string[]>(ENGAGED_POST_IDS_QUERY_KEY, (previous) => {
    const current = previous ?? NO_POST_IDS;
    return current.includes(postId) ? current : [...current, postId];
  });
};
