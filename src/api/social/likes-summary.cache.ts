import type { QueryClient, QueryKey } from '@tanstack/react-query';
import type { PostLikeSummary } from './likes-summary.types';

/** Racine de toutes les cles du resume des likes (reconnexion WebSocket : tout invalider). */
export const LIKES_SUMMARY_QUERY_KEY = ['likes-summary'] as const;

const POST_SEGMENT = 'post';
const BATCH_SEGMENT = 'batch';

/** Duree pendant laquelle un lot reste frais : les evenements WebSocket gardent le reste a jour. */
export const LIKES_SUMMARY_STALE_MS = 30_000;
/** Un resume par post doit survivre a un cellule sortie de l'ecran (defilement long). */
export const LIKE_SUMMARY_GC_MS = 30 * 60_000;

/** Cache par post : c'est ce que lisent les cellules, sans requete. */
export const likeSummaryKey = (postId: string) =>
  [...LIKES_SUMMARY_QUERY_KEY, POST_SEGMENT, postId] as const;

/** Un lot (100 ids max) : c'est l'unite de requete reseau. La cle depend de ses ids, dans l'ordre. */
export const likesSummaryChunkKey = (postIds: readonly string[]) =>
  [...LIKES_SUMMARY_QUERY_KEY, BATCH_SEGMENT, postIds] as const;

const chunkContains = (queryKey: QueryKey, postId: string): boolean => {
  const ids: unknown = queryKey[2];
  return queryKey[1] === BATCH_SEGMENT && Array.isArray(ids) && ids.includes(postId);
};

const concernsPost = (queryKey: QueryKey, postId: string): boolean =>
  (queryKey[0] === LIKES_SUMMARY_QUERY_KEY[0] &&
    queryKey[1] === POST_SEGMENT &&
    queryKey[2] === postId) ||
  (queryKey[0] === LIKES_SUMMARY_QUERY_KEY[0] && chunkContains(queryKey, postId));

/** Copie les resumes recus dans le cache par post. */
export const writeLikeSummaries = (
  queryClient: QueryClient,
  summaries: readonly PostLikeSummary[],
): void => {
  queryClient.setQueryDefaults([...LIKES_SUMMARY_QUERY_KEY, POST_SEGMENT], {
    gcTime: LIKE_SUMMARY_GC_MS,
  });
  summaries.forEach((summary) => {
    queryClient.setQueryData<PostLikeSummary>(likeSummaryKey(summary.postId), summary);
  });
};

/**
 * Modifie le resume en cache d'un post. Sans resume connu on ne fabrique rien (un faux "non like"
 * ou un faux compteur) : retourne `undefined`. Sinon retourne l'etat precedent pour un rollback.
 */
export const patchLikeSummary = (
  queryClient: QueryClient,
  postId: string,
  update: (current: PostLikeSummary) => PostLikeSummary,
): PostLikeSummary | undefined => {
  const previous = queryClient.getQueryData<PostLikeSummary>(likeSummaryKey(postId));
  if (previous === undefined) return undefined;
  queryClient.setQueryData<PostLikeSummary>(likeSummaryKey(postId), update(previous));
  return previous;
};

export const restoreLikeSummary = (
  queryClient: QueryClient,
  postId: string,
  previous: PostLikeSummary | undefined,
): void => {
  if (previous !== undefined) {
    queryClient.setQueryData<PostLikeSummary>(likeSummaryKey(postId), previous);
  }
};

/** Annule les requetes en vol qui reecriraient ce post avec une valeur anterieure a l'action. */
export const cancelLikesSummary = async (
  queryClient: QueryClient,
  postId: string,
): Promise<void> => {
  await queryClient.cancelQueries({ predicate: (query) => concernsPost(query.queryKey, postId) });
};

/** Marque le resume du post perime et relance les lots actifs qui le contiennent. */
export const invalidateLikesSummary = (queryClient: QueryClient, postId: string): void => {
  void queryClient.invalidateQueries({
    predicate: (query) => concernsPost(query.queryKey, postId),
  });
};
