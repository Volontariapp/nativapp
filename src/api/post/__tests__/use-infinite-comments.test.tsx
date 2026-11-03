import { act } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ListCommentsWebResponse } from '@volontariapp/contracts';
import { postApi } from '../post.api';
import { useInfiniteComments } from '../hooks/use-infinite-comments';
import { COMMENTS_LIST_QUERY_KEY } from '../comments-query-keys';
import { createComment } from '@/components/post/__tests__/comment.factory';
import { createQueryWrapper, createTestQueryClient } from '@/api/__tests__/query-wrapper.factory';

jest.mock('../../client', () => ({ apiFetch: jest.fn() }));

const createPage = (page: number, totalPages: number, count: number): ListCommentsWebResponse => ({
  comments: Array.from({ length: count }, (_, i) =>
    createComment({ id: `c-${String(page)}-${String(i)}` }),
  ),
  totalCount: 25,
  total: 25,
  page,
  limit: 10,
  totalPages,
});

describe('useInfiniteComments', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads page 1 then the next pages until totalPages is reached', async () => {
    const spy = jest
      .spyOn(postApi, 'listComments')
      .mockResolvedValueOnce(createPage(1, 3, 10))
      .mockResolvedValueOnce(createPage(2, 3, 10))
      .mockResolvedValueOnce(createPage(3, 3, 5));

    const { result } = renderHook(() => useInfiniteComments('post-1'), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(1);
    });
    expect(spy).toHaveBeenLastCalledWith('post-1', { page: 1, limit: 10 });
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });
    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(spy).toHaveBeenLastCalledWith('post-1', { page: 3, limit: 10 });
    await waitFor(() => {
      expect(result.current.data?.pages.flatMap((p) => p.comments)).toHaveLength(25);
    });
    expect(result.current.hasNextPage).toBe(false);
  });

  it('uses a key covered by the existing comment invalidations', async () => {
    const spy = jest.spyOn(postApi, 'listComments').mockResolvedValue(createPage(1, 1, 2));
    const client = createTestQueryClient();
    const { result } = renderHook(() => useInfiniteComments('post-1'), {
      wrapper: createQueryWrapper(client),
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    await client.invalidateQueries({ queryKey: [...COMMENTS_LIST_QUERY_KEY, 'post-1'] });

    expect(
      client.getQueryState([...COMMENTS_LIST_QUERY_KEY, 'post-1', 'infinite', 10])?.isInvalidated,
    ).toBe(false);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('does not fetch without a post id', () => {
    const spy = jest.spyOn(postApi, 'listComments');
    renderHook(() => useInfiniteComments(''), { wrapper: createQueryWrapper() });
    expect(spy).not.toHaveBeenCalled();
  });
});
