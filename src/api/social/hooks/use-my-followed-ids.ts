import { useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { shouldLoadNextPage } from '@/shared/lib/paging.utils';
import { socialApi } from '../social.api';
import { MY_FOLLOWS_QUERY_KEY } from './use-get-my-follows';

const PAGE_SIZE = 100;
/** 100 x 10 : borne le cout reseau (le serveur plafonne a 1000 abonnements par liste). */
const MAX_PAGES = 10;

interface UseMyFollowedIdsResult {
  /** Identifiants de tous les comptes que je suis. */
  followedIds: ReadonlySet<string>;
  /** Vrai tant que des pages restent a charger : l'ensemble n'est pas encore complet. */
  isLoading: boolean;
}

const NO_IDS: ReadonlySet<string> = new Set();

/**
 * Tous mes abonnements, charges page par page, pour savoir d'un coup d'oeil qui je suis (tri d'une
 * liste de participants). La cle commence par `my-follows` : un follow ou unfollow la recharge.
 */
export const useMyFollowedIds = (enabled = true): UseMyFollowedIdsResult => {
  const query = useInfiniteQuery({
    queryKey: [...MY_FOLLOWS_QUERY_KEY, 'ids', PAGE_SIZE],
    queryFn: ({ pageParam }) => socialApi.getMyFollows({ page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((count, p) => count + p.users.length, 0);
      const total = lastPage.pagination?.total ?? loaded;
      return lastPage.users.length > 0 && loaded < total ? allPages.length + 1 : undefined;
    },
    enabled,
  });

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  const loadedPages = query.data?.pages.length ?? 0;

  useEffect(() => {
    if (shouldLoadNextPage({ hasNextPage, isFetchingNextPage, loadedPages, maxPages: MAX_PAGES })) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, loadedPages, fetchNextPage]);

  const followedIds = useMemo(
    () =>
      query.data === undefined
        ? NO_IDS
        : new Set(query.data.pages.flatMap((p) => p.users.map((user) => user.id))),
    [query.data],
  );

  const hasMorePages = hasNextPage && loadedPages < MAX_PAGES;
  return { followedIds, isLoading: enabled && (query.isLoading || hasMorePages) };
};
