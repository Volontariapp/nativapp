import { renderHook, waitFor } from '@testing-library/react-native';
import type { ListUsersWebResponse } from '@volontariapp/contracts';
import { createQueryWrapper } from '../../../__tests__/query-wrapper.factory';
import { createUserWeb } from '../../../user/__tests__/user.factory';
import { useMyFollowedIds } from '../use-my-followed-ids';

const mockGetMyFollows = jest.fn<Promise<ListUsersWebResponse>, [unknown]>();

jest.mock('../../social.api', () => ({
  socialApi: { getMyFollows: (params: unknown): unknown => mockGetMyFollows(params) },
}));

const page = (ids: string[], pageNumber: number, total: number): ListUsersWebResponse => ({
  users: ids.map((id) => createUserWeb({ id })),
  pagination: { total, page: pageNumber, limit: ids.length, totalPages: 2 },
});

describe('useMyFollowedIds', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('collects the ids of everybody I follow across all pages', async () => {
    mockGetMyFollows
      .mockResolvedValueOnce(page(['u1', 'u2'], 1, 3))
      .mockResolvedValueOnce(page(['u3'], 2, 3));

    const { result } = renderHook(() => useMyFollowedIds(), { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect([...result.current.followedIds].sort()).toEqual(['u1', 'u2', 'u3']);
    expect(mockGetMyFollows).toHaveBeenCalledTimes(2);
  });

  it('reports loading until every page is in, so the order never flickers', async () => {
    mockGetMyFollows
      .mockResolvedValueOnce(page(['u1', 'u2'], 1, 3))
      .mockResolvedValueOnce(page(['u3'], 2, 3));

    const { result } = renderHook(() => useMyFollowedIds(), { wrapper: createQueryWrapper() });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('does not call the server when disabled', () => {
    const { result } = renderHook(() => useMyFollowedIds(false), {
      wrapper: createQueryWrapper(),
    });

    expect(mockGetMyFollows).not.toHaveBeenCalled();
    expect(result.current.followedIds.size).toBe(0);
  });

  it('is empty and done when I follow nobody', async () => {
    mockGetMyFollows.mockResolvedValueOnce(page([], 1, 0));

    const { result } = renderHook(() => useMyFollowedIds(), { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.followedIds.size).toBe(0);
  });
});
