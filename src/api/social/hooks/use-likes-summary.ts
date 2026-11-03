import { useEffect } from 'react';
import {
  skipToken,
  useQueries,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { socialApi } from '../social.api';
import {
  LIKES_SUMMARY_STALE_MS,
  LIKE_SUMMARY_GC_MS,
  likeSummaryKey,
  likesSummaryChunkKey,
  writeLikeSummaries,
} from '../likes-summary.cache';
import { chunkPostIds } from '../likes-summary.utils';
import type { PostLikeSummary } from '../likes-summary.types';

export interface LikesSummaryState {
  /** Resumes des lots recus (les ids absents ne sont pas encore connus ou ont echoue). */
  summaries: ReadonlyMap<string, PostLikeSummary>;
  /** Vrai tant qu'un lot n'a jamais abouti (premier chargement). */
  isPending: boolean;
  /** Vrai si au moins un lot a echoue. Les ids de ce lot restent inconnus, jamais "non likes". */
  isError: boolean;
}

const combineLikesSummary = (results: UseQueryResult<PostLikeSummary[]>[]): LikesSummaryState => ({
  summaries: new Map(
    results.flatMap((result) =>
      (result.data ?? []).map((summary): [string, PostLikeSummary] => [summary.postId, summary]),
    ),
  ),
  isPending: results.some((result) => result.isPending),
  isError: results.some((result) => result.isError),
});

/**
 * Charge likeCount et likedByMe des posts donnes, par lots de 100 (un appel par lot, jamais par
 * post) et copie chaque resume dans le cache par post lu par `usePostLikeSummary`. Les ids
 * dupliques sont fusionnes. Plus de 100 ids donnent plusieurs lots. La cle d'un lot depend de ses
 * ids : les lots pleins restent stables quand une page s'ajoute en fin de liste.
 */
export const useLikesSummary = (postIds: readonly string[]): LikesSummaryState => {
  const queryClient = useQueryClient();
  const state = useQueries({
    queries: chunkPostIds(postIds).map((chunk) => ({
      queryKey: likesSummaryChunkKey(chunk),
      queryFn: () => socialApi.getLikesSummary(chunk),
      staleTime: LIKES_SUMMARY_STALE_MS,
    })),
    combine: combineLikesSummary,
  });

  const { summaries } = state;
  useEffect(() => {
    writeLikeSummaries(queryClient, [...summaries.values()]);
  }, [queryClient, summaries]);

  return state;
};

/**
 * Lit le resume d'un post depuis le cache, sans jamais lancer de requete. `data` est `undefined`
 * tant que le lot du post n'est pas arrive (ou a echoue) : ne pas l'afficher comme "non like".
 */
export const usePostLikeSummary = (postId: string): UseQueryResult<PostLikeSummary> =>
  useQuery<PostLikeSummary>({
    queryKey: likeSummaryKey(postId),
    queryFn: skipToken,
    staleTime: Infinity,
    gcTime: LIKE_SUMMARY_GC_MS,
  });

/**
 * Recupere de force (sans cache frais) les resumes de ces posts, ecrit les caches par post et par
 * lot. Rejette si un lot echoue, pour que l'appelant ne conclue pas a tort que rien n'est like.
 */
export const fetchLikesSummary = async (
  queryClient: QueryClient,
  postIds: readonly string[],
): Promise<ReadonlyMap<string, PostLikeSummary>> => {
  const chunks = await Promise.all(
    chunkPostIds(postIds).map((chunk) =>
      queryClient.query({
        queryKey: likesSummaryChunkKey(chunk),
        queryFn: () => socialApi.getLikesSummary(chunk),
        staleTime: 0,
      }),
    ),
  );
  const summaries = chunks.flat();
  writeLikeSummaries(queryClient, summaries);
  return new Map(summaries.map((summary): [string, PostLikeSummary] => [summary.postId, summary]));
};
