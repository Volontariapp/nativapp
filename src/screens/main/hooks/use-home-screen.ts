import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FlatList } from 'react-native';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useRankingFeed } from '@/api/ranking/hooks/use-ranking-feed';
import { useListPosts } from '@/api/post/hooks/use-list-all-posts';
import { useEngagedPostIds } from '@/api/post/hooks/use-engaged-post-ids';
import { fetchLikesSummary, useLikesSummary } from '@/api/social/hooks/use-likes-summary';
import type { PostLikeSummary } from '@/api/social/likes-summary.types';
import { rankingApi, type RankingFeedResult } from '@/api/ranking/ranking.api';
import { useAuth } from '@/context/auth/auth.context';
import type { PostWeb } from '@volontariapp/contracts';
import { dedupeById } from '@/shared/utils/dedupe-by-id';
import {
  applyPinnedOrder,
  unseenFirst,
  withoutHandledPosts,
} from '../helpers/feed-visibility.helpers';

const FEED_PAGE_LIMIT = 10;
// Pages consecutives chargees d'office quand la derniere page n'ajoute aucun post visible.
const MAX_AUTO_PAGES = 3;

export interface UseHomeScreenResult {
  posts: PostWeb[];
  isLoading: boolean;
  isError: boolean;
  isFallbackMode: boolean;
  isRefreshing: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  flatListRef: React.RefObject<FlatList<PostWeb> | null>;
  handleRefresh: () => Promise<void>;
  retry: () => void;
  handleLoadMore: () => void;
}

const rankedPostsOf = (data: InfiniteData<RankingFeedResult> | undefined): PostWeb[] =>
  dedupeById(data?.pages.flatMap((page) => (page.isFallback ? [] : page.posts)) ?? []);

const fallbackPostsOf = (data: InfiniteData<{ posts: PostWeb[] }> | undefined): PostWeb[] =>
  dedupeById(data?.pages.flatMap((page) => page.posts) ?? []);

export function useHomeScreen(): UseHomeScreenResult {
  const flatListRef = useRef<FlatList<PostWeb> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const engagedPostIds = useEngagedPostIds();
  // Photo des posts a ne plus proposer, prise quand le resume d'un post arrive puis a chaque
  // refresh : un post que l'on like sous ses yeux reste affiche jusqu'au prochain refresh.
  const [handledIds, setHandledIds] = useState<ReadonlySet<string>>(new Set());
  // Posts dont le resume des likes a ete evalue (liked ou non) : les autres sont encore inconnus.
  const [evaluatedIds, setEvaluatedIds] = useState<ReadonlySet<string>>(new Set());
  // Ordre fige au dernier refresh : les posts jamais affiches d'abord.
  const [pinnedOrder, setPinnedOrder] = useState<readonly string[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  // Posts visibles lors de la derniere page evaluee, et pages chargees d'office depuis.
  const visibleBaselineRef = useRef(0);
  const autoPagesRef = useRef(0);
  const rankingQuery = useRankingFeed({ limit: FEED_PAGE_LIMIT });
  const firstPage = rankingQuery.data?.pages[0];
  const hasRankedPosts = Boolean(firstPage && !firstPage.isFallback && firstPage.posts.length > 0);
  const isFallbackMode =
    Boolean(firstPage?.isFallback) ||
    rankingQuery.isError ||
    (rankingQuery.isSuccess && !hasRankedPosts);
  // Le repli chronologique ne part que si le ranking ne suffit pas (echec, 206 ou liste vide).
  const fallbackQuery = useListPosts({ limit: FEED_PAGE_LIMIT, enabled: isFallbackMode });

  // Posts du mode courant, avant filtrage. Le resume des likes (likedByMe) est charge par lots de
  // 100 pour tous ceux qui ne sont pas de l'utilisateur.
  const candidates = useMemo(
    (): PostWeb[] =>
      isFallbackMode ? fallbackPostsOf(fallbackQuery.data) : rankedPostsOf(rankingQuery.data),
    [isFallbackMode, rankingQuery.data, fallbackQuery.data],
  );
  const summaryIds = useMemo(
    () => candidates.filter((post) => post.authorId !== userId).map((post) => post.id),
    [candidates, userId],
  );
  const likesSummary = useLikesSummary(summaryIds);

  // Resumes recus mais pas encore evalues. Ils comptent des le rendu (sans attendre l'effet qui les
  // enregistre) pour qu'un post deja like ne s'affiche jamais, meme un instant. Un lot en echec
  // n'evalue rien : ses posts ne sont jamais traites comme "non likes" a tort.
  const freshSummaries = useMemo(
    () =>
      [...likesSummary.summaries.values()].filter((summary) => !evaluatedIds.has(summary.postId)),
    [likesSummary.summaries, evaluatedIds],
  );
  useEffect(() => {
    if (freshSummaries.length === 0) return;
    setEvaluatedIds((previous) => new Set([...previous, ...freshSummaries.map((s) => s.postId)]));
    setHandledIds(
      (previous) =>
        new Set([
          ...previous,
          ...freshSummaries.filter((summary) => summary.likedByMe).map((summary) => summary.postId),
          ...engagedPostIds,
        ]),
    );
  }, [freshSummaries, engagedPostIds]);

  // Tant que le resume d'un post est en cours de chargement on ne l'affiche pas (il pourrait etre
  // deja like). Une fois le chargement termine, un post sans resume (echec) reste affiche.
  const isSummaryPending = likesSummary.isPending;
  const posts = useMemo((): PostWeb[] => {
    const received = new Set(freshSummaries.map((summary) => summary.postId));
    const known = isSummaryPending
      ? candidates.filter(
          (post) => post.authorId === userId || evaluatedIds.has(post.id) || received.has(post.id),
        )
      : candidates;
    const handled =
      freshSummaries.length === 0
        ? handledIds
        : new Set([
            ...handledIds,
            ...freshSummaries.filter((summary) => summary.likedByMe).map((s) => s.postId),
            ...engagedPostIds,
          ]);
    return applyPinnedOrder(withoutHandledPosts(known, handled, userId), pinnedOrder);
  }, [
    candidates,
    freshSummaries,
    isSummaryPending,
    evaluatedIds,
    handledIds,
    engagedPostIds,
    userId,
    pinnedOrder,
  ]);

  const isFeedLoading = isFallbackMode ? fallbackQuery.isLoading : rankingQuery.isLoading;
  const isLoading =
    isFeedLoading || (isSummaryPending && posts.length === 0 && summaryIds.length > 0);
  // En mode repli, le repli qui echoue est l'erreur visible (le ranking est deja en echec ou vide).
  const isError = isFallbackMode ? fallbackQuery.isError : rankingQuery.isError;
  const hasNextPage = isFallbackMode ? fallbackQuery.hasNextPage : rankingQuery.hasNextPage;
  const isFetchingNextPage = isFallbackMode
    ? fallbackQuery.isFetchingNextPage
    : rankingQuery.isFetchingNextPage;

  // Change a chaque page chargee : relance l'evaluation meme si l'etat de chargement n'a pas ete rendu.
  const loadedPagesCount =
    (isFallbackMode ? fallbackQuery.data?.pages.length : rankingQuery.data?.pages.length) ?? 0;

  // Derniers etats lus par les callbacks stables : evite de les recreer a chaque rendu des useQuery.
  const latestRef = useRef({
    posts,
    isFallbackMode,
    rankingQuery,
    fallbackQuery,
    handledIds,
    engagedPostIds,
    userId,
    hasNextPage,
    isFetchingNextPage,
  });
  latestRef.current = {
    posts,
    isFallbackMode,
    rankingQuery,
    fallbackQuery,
    handledIds,
    engagedPostIds,
    userId,
    hasNextPage,
    isFetchingNextPage,
  };

  // Rafraîchissement manuel (Pull-to-refresh)
  const handleRefresh = useCallback(async (): Promise<void> => {
    const {
      posts,
      isFallbackMode,
      rankingQuery,
      fallbackQuery,
      handledIds,
      engagedPostIds,
      userId,
    } = latestRef.current;
    setIsRefreshing(true);
    try {
      posts.forEach((post) => seenIdsRef.current.add(post.id));
      try {
        await rankingApi.requestRefresh('POST');
      } catch (err) {
        console.warn('[useHomeScreen] requestRefresh POST failed or throttled:', err);
      }
      const [rankingResult, fallbackResult] = await Promise.all([
        rankingQuery.refetch(),
        isFallbackMode ? fallbackQuery.refetch() : Promise.resolve(undefined),
      ]);

      // Resumes a jour des posts recus, en force. Un echec garde l'etat precedent (jamais de faux
      // "non like") : les posts deja ecartes le restent.
      const fresh = new Map<string, PostLikeSummary>();
      const loadSummaries = async (list: readonly PostWeb[]): Promise<boolean> => {
        const ids = list
          .filter((post) => post.authorId !== userId && !fresh.has(post.id))
          .map((post) => post.id);
        if (ids.length === 0) return true;
        try {
          (await fetchLikesSummary(queryClient, ids)).forEach((summary, id) => {
            fresh.set(id, summary);
          });
          return true;
        } catch (err) {
          console.warn('[useHomeScreen] likes summary refresh failed:', err);
          return false;
        }
      };
      const handledAfter = (): ReadonlySet<string> =>
        new Set([
          ...[...handledIds].filter((id) => !fresh.has(id)),
          ...[...fresh.values()].filter((s) => s.likedByMe).map((s) => s.postId),
          ...engagedPostIds,
        ]);
      const keepNew = (candidates: PostWeb[]): PostWeb[] =>
        withoutHandledPosts(candidates, handledAfter(), userId);

      const refreshed = isFallbackMode
        ? fallbackPostsOf(fallbackResult?.data)
        : rankedPostsOf(rankingResult.data);
      await loadSummaries(refreshed);
      let visible = keepNew(refreshed);
      // Le worker n'a rien recalcule : on va chercher la suite de la liste plutot que de rejouer les memes posts.
      const hasUnseen = visible.some((post) => !seenIdsRef.current.has(post.id));
      if (!isFallbackMode && !hasUnseen && rankingQuery.hasNextPage) {
        const more = await rankingQuery.fetchNextPage();
        const moreCandidates = rankedPostsOf(more.data);
        await loadSummaries(moreCandidates);
        visible = keepNew(moreCandidates);
      }

      setHandledIds(handledAfter());
      setEvaluatedIds((previous) => new Set([...previous, ...fresh.keys()]));
      setPinnedOrder(unseenFirst(visible, seenIdsRef.current).map((post) => post.id));
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  // Relance la requete en echec : le repli en mode repli, plus le ranking s'il est lui aussi en erreur.
  const retry = useCallback((): void => {
    const { isFallbackMode, rankingQuery, fallbackQuery } = latestRef.current;
    if (isFallbackMode) {
      void fallbackQuery.refetch();
      if (rankingQuery.isError) {
        void rankingQuery.refetch();
      }
    } else {
      void rankingQuery.refetch();
    }
  }, []);

  const fetchMore = useCallback((): void => {
    const { hasNextPage, isFetchingNextPage, isFallbackMode, fallbackQuery, rankingQuery } =
      latestRef.current;
    if (hasNextPage && !isFetchingNextPage) {
      if (isFallbackMode) {
        void fallbackQuery.fetchNextPage();
      } else {
        void rankingQuery.fetchNextPage();
      }
    }
  }, []);

  // Action de l'utilisateur (scroll en fin de liste) : rearme le chargement automatique.
  const handleLoadMore = useCallback((): void => {
    autoPagesRef.current = 0;
    fetchMore();
  }, [fetchMore]);

  // Le filtrage client (posts likes, commentes, de l'utilisateur) vient apres la pagination : une
  // page peut n'ajouter aucun post visible alors qu'il en reste, et onEndReached ne se redeclenche
  // pas sur une liste qui ne grandit pas. On charge donc la suite d'office, 3 pages au plus.
  useEffect(() => {
    visibleBaselineRef.current = 0;
    autoPagesRef.current = 0;
  }, [isFallbackMode]);

  useEffect(() => {
    if (isLoading || isError || isFetchingNextPage || !hasNextPage || isSummaryPending) return;
    if (posts.length > visibleBaselineRef.current) {
      visibleBaselineRef.current = posts.length;
      autoPagesRef.current = 0;
      return;
    }
    if (posts.length < visibleBaselineRef.current) {
      visibleBaselineRef.current = posts.length;
      if (posts.length > 0) return;
    }
    if (autoPagesRef.current >= MAX_AUTO_PAGES) return;
    autoPagesRef.current += 1;
    fetchMore();
  }, [
    posts.length,
    loadedPagesCount,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    isSummaryPending,
    fetchMore,
  ]);

  return {
    posts,
    isLoading,
    isError,
    isFallbackMode,
    isRefreshing,
    hasNextPage,
    isFetchingNextPage,
    flatListRef,
    handleRefresh,
    retry,
    handleLoadMore,
  };
}
