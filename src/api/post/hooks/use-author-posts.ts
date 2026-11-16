import { useCallback, useMemo, useState } from 'react';
import type { PostWeb } from '@volontariapp/contracts';
import { dedupeById } from '@/shared/utils/dedupe-by-id';
import { useListPosts } from './use-list-all-posts';

export const AUTHOR_POSTS_STEP = 9;

export interface UseAuthorPostsResult {
  posts: PostWeb[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

/**
 * Charge les publications d'un utilisateur par paliers de 9 carreaux (3 rangées de 3 colonnes)
 * pour la grille des profils publics.
 */
export function useAuthorPosts(
  authorId: string | undefined,
  step: number = AUTHOR_POSTS_STEP,
): UseAuthorPostsResult {
  const {
    data,
    isLoading,
    hasNextPage: hasMoreServerPages,
    isFetchingNextPage,
    fetchNextPage: fetchNextServerPage,
  } = useListPosts({
    authorId,
    limit: step,
    enabled: authorId !== undefined && authorId.length > 0,
  });

  const [visibleCount, setVisibleCount] = useState(step);

  const loadedPosts = useMemo(
    () => dedupeById(data?.pages.flatMap((page) => page.posts) ?? []),
    [data],
  );

  const posts = useMemo(
    () => loadedPosts.slice(0, visibleCount),
    [loadedPosts, visibleCount],
  );

  const hasNextPage = visibleCount < loadedPosts.length || hasMoreServerPages;

  const fetchNextPage = useCallback((): void => {
    const nextCount = visibleCount + step;
    setVisibleCount(nextCount);
    if (nextCount > loadedPosts.length && hasMoreServerPages && !isFetchingNextPage) {
      void fetchNextServerPage();
    }
  }, [
    visibleCount,
    step,
    loadedPosts.length,
    hasMoreServerPages,
    isFetchingNextPage,
    fetchNextServerPage,
  ]);

  return {
    posts,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  };
}
