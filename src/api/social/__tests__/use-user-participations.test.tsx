import { renderHook, waitFor } from '@testing-library/react-native';
import { socialApi } from '../social.api';
import { useUserParticipations } from '../hooks/use-user-participations';
import { createQueryWrapper } from '@/api/__tests__/query-wrapper.factory';

jest.mock('../../client', () => ({ apiFetch: jest.fn() }));

const ids = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, i) => `${prefix}-${String(i)}`);

describe('useUserParticipations', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads every page automatically with autoFetchAll', async () => {
    const spy = jest
      .spyOn(socialApi, 'getMyParticipations')
      .mockResolvedValueOnce({ ids: ids('a', 100), totalCount: 130 })
      .mockResolvedValueOnce({ ids: ids('b', 30), totalCount: 130 });

    const { result } = renderHook(() => useUserParticipations(100, { autoFetchAll: true }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2);
    });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('does not fetch further pages without autoFetchAll', async () => {
    const spy = jest
      .spyOn(socialApi, 'getMyParticipations')
      .mockResolvedValue({ ids: ids('a', 10), totalCount: 100 });

    const { result } = renderHook(() => useUserParticipations(10), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result.current.hasNextPage).toBe(true);
  });
});
