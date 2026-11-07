import React, { act } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type {
  GetRankingFeedWebRequest,
  RankingListKindWeb,
  RequestRankingRefreshWebResponse,
  PostWeb,
} from '@volontariapp/contracts';
import { useHomeScreen } from '../use-home-screen';
import type { RankedAppPost, RankingFeedResult } from '@/api/ranking/ranking.api';
import type { PostLikeSummary } from '@/api/social/likes-summary.types';

const mockGetFeed = jest.fn<Promise<RankingFeedResult>, [GetRankingFeedWebRequest?]>();
const mockRequestRefresh = jest.fn<
  Promise<RequestRankingRefreshWebResponse>,
  [RankingListKindWeb]
>();

jest.mock('@/api/ranking/ranking.api', () => ({
  rankingApi: {
    getFeed: (params?: GetRankingFeedWebRequest) => mockGetFeed(params),
    requestRefresh: (listKind: RankingListKindWeb) => mockRequestRefresh(listKind),
  },
}));

interface MockListPostsReturn {
  data: { pages: Array<{ posts: PostWeb[]; totalCount: number }> };
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  refetch: () => Promise<unknown>;
}

const mockRefetchFallback = jest.fn().mockResolvedValue({});
const mockFetchNextPageFallback = jest.fn();

const mockUseListPosts = jest.fn<MockListPostsReturn, [unknown?]>();
jest.mock('@/api/post/hooks/use-list-all-posts', () => ({
  useListPosts: (params?: unknown) => mockUseListPosts(params),
}));

let mockLikedIds = new Set<string>();
const mockGetLikesSummary = jest.fn<Promise<PostLikeSummary[]>, [readonly string[]]>();
jest.mock('@/api/social/social.api', () => ({
  socialApi: {
    getLikesSummary: (ids: readonly string[]) => mockGetLikesSummary(ids),
  },
}));

const CURRENT_USER_ID = 'current-user';
jest.mock('@/context/auth/auth.context', () => ({
  useAuth: () => ({ userId: CURRENT_USER_ID }),
}));

const mockMyLikes = (ids: string[]): void => {
  mockLikedIds = new Set(ids);
};

const rankingPage = (
  posts: RankedAppPost[],
  options: { hasMore: boolean; nextCursor: string },
): RankingFeedResult => ({
  posts,
  totalCount: posts.length,
  ranking: {
    source: 'FULL',
    computedAt: '2026-10-20T08:00:00.000Z',
    stale: false,
    hasMore: options.hasMore,
    versionChanged: false,
    listVersion: 'v1',
    nextCursor: options.nextCursor,
  },
  isFallback: false,
});

const createSamplePost = (id: string, title: string): RankedAppPost => ({
  id,
  title,
  content: 'Description du post',
  authorId: 'author-1',
  createdAt: new Date('2026-10-20T08:00:00.000Z'),
  updatedAt: new Date('2026-10-20T08:00:00.000Z'),
  rankingScore: 80,
  reasons: ['RECENT'],
});

const createdQueryClients: QueryClient[] = [];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  createdQueryClients.push(queryClient);

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Declare apres l'import de la testing library : s'execute apres son demontage automatique.
// writeLikeSummaries donne 30 minutes de gcTime aux resumes par post : sans clear(), leurs minuteries
// gardent le processus jest ouvert (un run isole ne rend pas la main avant la fin du delai).
afterEach(() => {
  createdQueryClients.splice(0).forEach((client) => {
    client.clear();
  });
});

beforeEach(() => {
  mockGetLikesSummary.mockImplementation((ids) =>
    Promise.resolve(
      ids.map((postId) => ({ postId, likeCount: 0, likedByMe: mockLikedIds.has(postId) })),
    ),
  );
});

describe('useHomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // clearAllMocks garde les implementations : un test ne doit pas heriter des reponses du precedent.
    mockGetFeed.mockReset();
    mockRequestRefresh.mockReset();
    mockMyLikes([]);
    mockUseListPosts.mockReturnValue({
      data: {
        pages: [
          {
            posts: [createSamplePost('post-fallback-1', 'Post Fallback')],
            totalCount: 1,
          },
        ],
      },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPageFallback,
      isFetchingNextPage: false,
      refetch: mockRefetchFallback,
    });
  });

  it('serves ranked posts and has isFallbackMode = false when ranking succeeds', async () => {
    mockGetFeed.mockResolvedValue({
      posts: [
        {
          ...createSamplePost('post-ranked-1', 'Post Classé 1'),
          rankingScore: 95.2,
          reasons: ['FOLLOWED_AUTHOR', 'TRENDING'],
        },
      ],
      totalCount: 1,
      ranking: {
        source: 'FULL',
        computedAt: '2026-10-20T08:00:00.000Z',
        stale: false,
        hasMore: false,
        versionChanged: false,
        listVersion: 'v1',
        nextCursor: '',
      },
      isFallback: false,
    });

    const { result } = renderHook(() => useHomeScreen(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isFallbackMode).toBe(false);
    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0]?.id).toBe('post-ranked-1');
  });

  it('detects 206 FALLBACK_ACTIVATED and smoothly falls back to useListPosts', async () => {
    mockGetFeed.mockResolvedValue({
      posts: [],
      totalCount: 0,
      ranking: null,
      isFallback: true,
    });

    const { result } = renderHook(() => useHomeScreen(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isFallbackMode).toBe(true);
    });

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0]?.id).toBe('post-fallback-1');
  });

  it('detects ranking error and smoothly falls back to useListPosts', async () => {
    mockGetFeed.mockRejectedValue(new Error('Network error on ranking'));

    const { result } = renderHook(() => useHomeScreen(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isFallbackMode).toBe(true);
    });

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0]?.id).toBe('post-fallback-1');
  });

  it('exposes isError and retry refetches the fallback when ranking and fallback both fail', async () => {
    mockGetFeed.mockRejectedValue(new Error('Network error on ranking'));
    mockUseListPosts.mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      isError: true,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPageFallback,
      isFetchingNextPage: false,
      refetch: mockRefetchFallback,
    });

    const { result } = renderHook(() => useHomeScreen(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isFallbackMode).toBe(true);
    });
    expect(result.current.isError).toBe(true);

    act(() => {
      result.current.retry();
    });
    expect(mockRefetchFallback).toHaveBeenCalledTimes(1);
  });

  it('falls back to useListPosts when ranking succeeds with 0 posts (empty run / cold-start)', async () => {
    mockGetFeed.mockResolvedValue({
      posts: [],
      totalCount: 0,
      ranking: {
        source: 'FULL',
        computedAt: '2026-10-20T08:00:00.000Z',
        stale: false,
        hasMore: false,
        versionChanged: false,
        listVersion: 'v1',
        nextCursor: '',
      },
      isFallback: false,
    });

    const { result } = renderHook(() => useHomeScreen(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isFallbackMode).toBe(true);
    });

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0]?.id).toBe('post-fallback-1');
  });

  it('calls rankingApi.requestRefresh with FEED on pull to refresh', async () => {
    mockGetFeed.mockResolvedValue({
      posts: [createSamplePost('post-ranked-1', 'Post Classé 1')],
      totalCount: 1,
      ranking: {
        source: 'FULL',
        computedAt: '2026-10-20T08:00:00.000Z',
        stale: false,
        hasMore: false,
        versionChanged: false,
        listVersion: 'v1',
        nextCursor: '',
      },
      isFallback: false,
    });
    mockRequestRefresh.mockResolvedValue({ accepted: true, refreshThrottled: false });

    const { result } = renderHook(() => useHomeScreen(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleRefresh();
    });

    expect(mockRequestRefresh).toHaveBeenCalledWith('POST');
  });

  it('handles load more when there are more pages', async () => {
    mockGetFeed.mockResolvedValue({
      posts: [createSamplePost('post-ranked-1', 'Post Classé 1')],
      totalCount: 2,
      ranking: {
        source: 'FULL',
        computedAt: '2026-10-20T08:00:00.000Z',
        stale: false,
        hasMore: true,
        versionChanged: false,
        listVersion: 'v1',
        nextCursor: 'cursor-2',
      },
      isFallback: false,
    });

    const { result } = renderHook(() => useHomeScreen(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(true);
    });

    act(() => {
      result.current.handleLoadMore();
    });

    await waitFor(() => {
      expect(mockGetFeed).toHaveBeenCalledTimes(2);
    });
  });

  it('never shows the posts of the user nor the posts already liked or commented', async () => {
    mockMyLikes(['post-liked']);
    mockGetFeed.mockResolvedValue(
      rankingPage(
        [
          createSamplePost('post-kept', 'Gardé'),
          createSamplePost('post-liked', 'Déjà liké'),
          { ...createSamplePost('post-own', 'Le mien'), authorId: CURRENT_USER_ID },
        ],
        { hasMore: false, nextCursor: '' },
      ),
    );

    const { result } = renderHook(() => useHomeScreen(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.posts.map((post) => post.id)).toEqual(['post-kept']);
    });
  });

  it('keeps a post the user likes on screen until the next refresh', async () => {
    mockGetFeed.mockResolvedValue(
      rankingPage([createSamplePost('post-a', 'A'), createSamplePost('post-b', 'B')], {
        hasMore: false,
        nextCursor: '',
      }),
    );
    mockRequestRefresh.mockResolvedValue({ accepted: true, refreshThrottled: false });

    const { result, rerender } = renderHook(() => useHomeScreen(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.posts).toHaveLength(2);
    });

    mockMyLikes(['post-a']);
    rerender({});
    expect(result.current.posts).toHaveLength(2);

    await act(async () => {
      await result.current.handleRefresh();
    });

    expect(result.current.posts.map((post) => post.id)).toEqual(['post-b']);
  });

  it('requests the likes summary once per page of ids, with the posts of the user left out', async () => {
    mockGetFeed.mockResolvedValue(
      rankingPage(
        [
          createSamplePost('post-a', 'A'),
          createSamplePost('post-b', 'B'),
          { ...createSamplePost('post-own', 'Le mien'), authorId: CURRENT_USER_ID },
        ],
        { hasMore: false, nextCursor: '' },
      ),
    );

    const { result } = renderHook(() => useHomeScreen(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.posts).toHaveLength(2);
    });

    expect(mockGetLikesSummary).toHaveBeenCalledTimes(1);
    expect(mockGetLikesSummary).toHaveBeenCalledWith(['post-a', 'post-b']);
  });

  it('still shows the posts when the likes summary fails (liked state unknown, not "not liked")', async () => {
    mockGetLikesSummary.mockRejectedValue(new Error('network down'));
    mockGetFeed.mockResolvedValue(
      rankingPage([createSamplePost('post-a', 'A')], { hasMore: false, nextCursor: '' }),
    );

    const { result } = renderHook(() => useHomeScreen(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.posts.map((post) => post.id)).toEqual(['post-a']);
    });
    expect(result.current.isError).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('keeps a liked post out after a refresh whose likes summary fails', async () => {
    mockMyLikes(['post-a']);
    mockGetFeed.mockResolvedValue(
      rankingPage([createSamplePost('post-a', 'A'), createSamplePost('post-b', 'B')], {
        hasMore: false,
        nextCursor: '',
      }),
    );
    mockRequestRefresh.mockResolvedValue({ accepted: true, refreshThrottled: false });

    const { result } = renderHook(() => useHomeScreen(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.posts.map((post) => post.id)).toEqual(['post-b']);
    });

    mockGetLikesSummary.mockRejectedValue(new Error('network down'));
    await act(async () => {
      await result.current.handleRefresh();
    });

    expect(result.current.posts.map((post) => post.id)).toEqual(['post-b']);
  });

  it('puts the posts never displayed first when a refresh brings no new ranking', async () => {
    mockGetFeed.mockImplementation((params) =>
      Promise.resolve(
        params?.cursor === 'cursor-2'
          ? rankingPage([createSamplePost('post-3', 'Trois')], { hasMore: false, nextCursor: '' })
          : rankingPage([createSamplePost('post-1', 'Un'), createSamplePost('post-2', 'Deux')], {
              hasMore: true,
              nextCursor: 'cursor-2',
            }),
      ),
    );
    mockRequestRefresh.mockResolvedValue({ accepted: true, refreshThrottled: false });

    const { result } = renderHook(() => useHomeScreen(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.posts.map((post) => post.id)).toEqual(['post-1', 'post-2']);
    });

    await act(async () => {
      await result.current.handleRefresh();
    });

    expect(result.current.posts.map((post) => post.id)).toEqual(['post-3', 'post-1', 'post-2']);
  });
});

describe('useHomeScreen pagination hygiene', () => {
  const rankedPage = (ids: string[], hasMore: boolean, nextCursor: string): RankingFeedResult =>
    rankingPage(
      ids.map((id) => createSamplePost(id, id)),
      { hasMore, nextCursor },
    );

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFeed.mockReset();
    mockRequestRefresh.mockReset();
    mockMyLikes([]);
    mockUseListPosts.mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPageFallback,
      isFetchingNextPage: false,
      refetch: mockRefetchFallback,
    });
  });

  it('keeps the chronological fallback disabled while the ranking is usable', async () => {
    mockGetFeed.mockResolvedValue(rankedPage(['post-1'], false, ''));

    const { result } = renderHook(() => useHomeScreen(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.posts).toHaveLength(1);
    });

    const calls = mockUseListPosts.mock.calls as Array<[{ enabled?: boolean }?]>;
    expect(calls.every(([params]) => params?.enabled === false)).toBe(true);
  });

  it('enables the fallback when the ranking fails', async () => {
    mockGetFeed.mockRejectedValue(new Error('ranking down'));

    renderHook(() => useHomeScreen(), { wrapper: createWrapper() });

    await waitFor(() => {
      const calls = mockUseListPosts.mock.calls as Array<[{ enabled?: boolean }?]>;
      expect(calls.some(([params]) => params?.enabled === true)).toBe(true);
    });
  });

  it('deduplicates a post that reappears on the next ranking page', async () => {
    mockGetFeed.mockImplementation((params) =>
      Promise.resolve(
        params?.cursor === 'cursor-2'
          ? rankedPage(['post-2', 'post-3'], false, '')
          : rankedPage(['post-1', 'post-2'], true, 'cursor-2'),
      ),
    );

    const { result } = renderHook(() => useHomeScreen(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(true);
    });
    act(() => {
      result.current.handleLoadMore();
    });

    await waitFor(() => {
      expect(result.current.posts.map((post) => post.id)).toEqual(['post-1', 'post-2', 'post-3']);
    });
  });

  it('loads the next ranking page by itself when the filtered page is empty', async () => {
    mockMyLikes(['post-1', 'post-2']);
    mockGetFeed.mockImplementation((params) =>
      Promise.resolve(
        params?.cursor === 'cursor-2'
          ? rankedPage(['post-3'], false, '')
          : rankedPage(['post-1', 'post-2'], true, 'cursor-2'),
      ),
    );

    const { result } = renderHook(() => useHomeScreen(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.posts.map((post) => post.id)).toEqual(['post-3']);
    });
    expect(mockGetFeed).toHaveBeenCalledTimes(2);
  });

  it('stops after 3 consecutive pages that add no visible post', async () => {
    mockMyLikes(['a', 'b', 'c', 'd', 'e']);
    const ids = ['a', 'b', 'c', 'd', 'e'];
    mockGetFeed.mockImplementation((params) => {
      const index = params?.cursor === undefined ? 0 : Number(params.cursor);
      return Promise.resolve(rankedPage([ids[index] ?? 'z'], true, String(index + 1)));
    });

    const { result } = renderHook(() => useHomeScreen(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockGetFeed).toHaveBeenCalledTimes(4);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockGetFeed).toHaveBeenCalledTimes(4);
    expect(result.current.posts).toHaveLength(0);
  });
});
