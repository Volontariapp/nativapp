import React, { act } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useLikesSummary, usePostLikeSummary } from '../hooks/use-likes-summary';
import { invalidateLikesSummary } from '../likes-summary.cache';
import type { PostLikeSummary } from '../likes-summary.types';

const mockGetLikesSummary = jest.fn<Promise<PostLikeSummary[]>, [readonly string[]]>();
jest.mock('../social.api', () => ({
  socialApi: { getLikesSummary: (ids: readonly string[]) => mockGetLikesSummary(ids) },
}));

const ids = (count: number): string[] => Array.from({ length: count }, (_, i) => `p-${String(i)}`);

const summaryOf = (postId: string, likeCount = 3, likedByMe = false): PostLikeSummary => ({
  postId,
  likeCount,
  likedByMe,
});

const clients: QueryClient[] = [];

const createClient = (): QueryClient => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  return client;
};

const createWrapper =
  (client: QueryClient) =>
  ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

describe('useLikesSummary', () => {
  beforeEach(() => {
    mockGetLikesSummary.mockImplementation((postIds) =>
      Promise.resolve(postIds.map((postId) => summaryOf(postId))),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    // Libere les minuteurs de garbage collection (30 min) pour que Jest puisse quitter.
    clients.splice(0).forEach((client) => {
      client.clear();
    });
  });

  it('makes one call per batch of 100 ids, never one per post', async () => {
    const client = createClient();
    const { result } = renderHook(() => useLikesSummary(ids(250)), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => {
      expect(result.current.summaries.size).toBe(250);
    });
    expect(mockGetLikesSummary.mock.calls.map(([chunk]) => chunk.length)).toEqual([100, 100, 50]);
    expect(result.current.isPending).toBe(false);
  });

  it('merges duplicate ids and does not call without ids', async () => {
    const client = createClient();
    const { result, rerender } = renderHook(
      ({ postIds }: { postIds: string[] }) => useLikesSummary(postIds),
      { wrapper: createWrapper(client), initialProps: { postIds: [] as string[] } },
    );
    expect(mockGetLikesSummary).not.toHaveBeenCalled();

    rerender({ postIds: ['a', 'a', 'b'] });

    await waitFor(() => {
      expect(result.current.summaries.size).toBe(2);
    });
    expect(mockGetLikesSummary).toHaveBeenCalledTimes(1);
    expect(mockGetLikesSummary).toHaveBeenCalledWith(['a', 'b']);
  });

  it('lets cells read their summary from the per-post cache without any request', async () => {
    const client = createClient();
    mockGetLikesSummary.mockResolvedValue([summaryOf('a', 7, true), summaryOf('b', 2, false)]);
    const wrapper = createWrapper(client);

    renderHook(() => useLikesSummary(['a', 'b']), { wrapper });
    const cell = renderHook(() => usePostLikeSummary('a'), { wrapper });
    expect(cell.result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(cell.result.current.data).toEqual(summaryOf('a', 7, true));
    });
    expect(mockGetLikesSummary).toHaveBeenCalledTimes(1);
  });

  it('does not call a per-post request when the summary is unknown', async () => {
    const client = createClient();
    const cell = renderHook(() => usePostLikeSummary('zzz'), { wrapper: createWrapper(client) });

    await act(async () => {
      await Promise.resolve();
    });

    expect(cell.result.current.data).toBeUndefined();
    expect(mockGetLikesSummary).not.toHaveBeenCalled();
  });

  it('keeps ids unknown (never "not liked") when a batch fails', async () => {
    const client = createClient();
    mockGetLikesSummary.mockRejectedValue(new Error('network down'));
    const wrapper = createWrapper(client);

    const list = renderHook(() => useLikesSummary(['a']), { wrapper });
    const cell = renderHook(() => usePostLikeSummary('a'), { wrapper });

    await waitFor(() => {
      expect(list.result.current.isError).toBe(true);
    });
    expect(list.result.current.summaries.size).toBe(0);
    expect(list.result.current.isPending).toBe(false);
    expect(cell.result.current.data).toBeUndefined();
  });

  it('refetches only the active batches that contain the post a WebSocket event concerns', async () => {
    const client = createClient();
    const firstIds = ids(100);
    const secondIds = ['other-1', 'other-2'];
    const { result } = renderHook(() => useLikesSummary([...firstIds, ...secondIds]), {
      wrapper: createWrapper(client),
    });
    await waitFor(() => {
      expect(result.current.summaries.size).toBe(102);
    });
    expect(mockGetLikesSummary).toHaveBeenCalledTimes(2);

    mockGetLikesSummary.mockImplementation((postIds) =>
      Promise.resolve(postIds.map((postId) => summaryOf(postId, 9, true))),
    );
    act(() => {
      invalidateLikesSummary(client, 'other-1');
    });

    await waitFor(() => {
      expect(result.current.summaries.get('other-1')?.likeCount).toBe(9);
    });
    expect(mockGetLikesSummary).toHaveBeenCalledTimes(3);
    expect(mockGetLikesSummary).toHaveBeenLastCalledWith(secondIds);
    expect(result.current.summaries.get('p-0')?.likeCount).toBe(3);
  });

  it('refreshes the per-post cache when a batch is refetched', async () => {
    const client = createClient();
    const wrapper = createWrapper(client);
    renderHook(() => useLikesSummary(['a']), { wrapper });
    const cell = renderHook(() => usePostLikeSummary('a'), { wrapper });
    await waitFor(() => {
      expect(cell.result.current.data?.likeCount).toBe(3);
    });

    mockGetLikesSummary.mockResolvedValue([summaryOf('a', 4, true)]);
    act(() => {
      invalidateLikesSummary(client, 'a');
    });

    await waitFor(() => {
      expect(cell.result.current.data).toEqual(summaryOf('a', 4, true));
    });
  });
});
