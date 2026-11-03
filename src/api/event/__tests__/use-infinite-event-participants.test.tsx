import { act } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { UserWeb } from '@volontariapp/contracts';
import { eventApi } from '../event.api';
import { useInfiniteEventParticipants } from '../hooks/use-infinite-event-participants';
import { createUserWeb } from '@/api/user/__tests__/user.factory';
import { createQueryWrapper } from '@/api/__tests__/query-wrapper.factory';

jest.mock('../../client', () => ({ apiFetch: jest.fn() }));

const createParticipants = (prefix: string, count: number): UserWeb[] =>
  Array.from({ length: count }, (_, i) => createUserWeb({ id: `${prefix}-${String(i)}` }));

describe('useInfiniteEventParticipants', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('paginates by 20 and ends the list at totalCount', async () => {
    const spy = jest
      .spyOn(eventApi, 'getEventParticipants')
      .mockResolvedValueOnce({ participants: createParticipants('a', 20), totalCount: 25 })
      .mockResolvedValueOnce({ participants: createParticipants('b', 5), totalCount: 25 });

    const { result } = renderHook(() => useInfiniteEventParticipants('event-1'), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(true);
    });
    expect(spy).toHaveBeenLastCalledWith('event-1', { page: 1, limit: 20 });

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.data?.pages.flatMap((p) => p.participants)).toHaveLength(25);
    });
    expect(result.current.hasNextPage).toBe(false);
  });

  it('surfaces the error instead of swallowing it', async () => {
    jest.spyOn(eventApi, 'getEventParticipants').mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useInfiniteEventParticipants('event-1'), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('is disabled without an event id', () => {
    const spy = jest.spyOn(eventApi, 'getEventParticipants');
    renderHook(() => useInfiniteEventParticipants(undefined), { wrapper: createQueryWrapper() });
    expect(spy).not.toHaveBeenCalled();
  });
});
