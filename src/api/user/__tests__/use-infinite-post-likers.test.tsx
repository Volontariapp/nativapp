import { act } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { userApi, type UserPublicProfile } from '../user.api';
import { useInfinitePostLikers } from '../hooks/use-infinite-post-likers';
import { createQueryWrapper } from '@/api/__tests__/query-wrapper.factory';

jest.mock('../../client', () => ({ apiFetch: jest.fn() }));

const createLikers = (prefix: string, count: number): UserPublicProfile[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${String(i)}`,
    pseudo: `user_${prefix}_${String(i)}`,
  })) as UserPublicProfile[];

describe('useInfinitePostLikers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('requests 20 likers per page and stops once totalCount is loaded', async () => {
    const spy = jest
      .spyOn(userApi, 'getPostLikers')
      .mockResolvedValueOnce({ users: createLikers('a', 20), totalCount: 30 })
      .mockResolvedValueOnce({ users: createLikers('b', 10), totalCount: 30 });

    const { result } = renderHook(() => useInfinitePostLikers('post-1'), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(true);
    });
    expect(spy).toHaveBeenLastCalledWith('post-1', { page: 1, limit: 20 });

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(spy).toHaveBeenLastCalledWith('post-1', { page: 2, limit: 20 });
    await waitFor(() => {
      expect(result.current.data?.pages.flatMap((p) => p.users)).toHaveLength(30);
    });
    expect(result.current.hasNextPage).toBe(false);
  });

  it('stops when a page comes back empty even if totalCount is larger', async () => {
    jest.spyOn(userApi, 'getPostLikers').mockResolvedValue({ users: [], totalCount: 50 });
    const { result } = renderHook(() => useInfinitePostLikers('post-1'), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.hasNextPage).toBe(false);
  });
});
