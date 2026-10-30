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

interface MockMyLikesReturn {
  data: { ids: string[]; totalCount: number };
  refetch: () => Promise<{ data: { ids: string[]; totalCount: number } }>;
}

const mockUseGetMyLikes = jest.fn<MockMyLikesReturn, []>();
jest.mock('@/api/social/hooks/use-get-my-likes', () => ({
  useGetMyLikes: () => mockUseGetMyLikes(),
}));

const CURRENT_USER_ID = 'current-user';
jest.mock('@/context/auth/auth.context', () => ({
  useAuth: () => ({ userId: CURRENT_USER_ID }),
}));

const mockMyLikes = (ids: string[]): void => {
  const data = { ids, totalCount: ids.length };
  mockUseGetMyLikes.mockReturnValue({ data, refetch: jest.fn().mockResolvedValue({ data }) });
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

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useHomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
