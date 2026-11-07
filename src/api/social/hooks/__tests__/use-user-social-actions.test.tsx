import { act } from 'react';
import { renderHook } from '@testing-library/react-native';
import type { QueryClient } from '@tanstack/react-query';
import { createQueryWrapper, createTestQueryClient } from '../../../__tests__/query-wrapper.factory';
import { socialApi } from '../../social.api';
import { useUserSocialActions } from '../use-user-social-actions';

jest.mock('../../social.api', () => ({
  socialApi: {
    participate: jest.fn(),
    unparticipate: jest.fn(),
    wishEvent: jest.fn(),
    unwishEvent: jest.fn(),
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
  },
}));

const api = jest.mocked(socialApi);
const WISHED_KEY = ['wished-events', { limit: 10 }] as const;

interface WishedPages {
  pages: { totalCount: number; events: { id: string }[] }[];
  pageParams: number[];
}

const wishedList = (ids: string[], totalCount = ids.length): WishedPages => ({
  pages: [{ totalCount, events: ids.map((id) => ({ id })) }],
  pageParams: [1],
});

const exactInvalidations = (spy: jest.SpyInstance, queryKey: unknown[]): number =>
  spy.mock.calls.filter(
    ([arg]) => JSON.stringify(arg) === JSON.stringify({ queryKey }),
  ).length;

describe('useUserSocialActions', () => {
  let queryClient: QueryClient;
  let invalidateSpy: jest.SpyInstance;

  const render = () =>
    renderHook(() => useUserSocialActions(), { wrapper: createQueryWrapper(queryClient) });

  // Le rafraichissement de la wishlist est differe (anti-rafale) : on avance l'horloge pour l'observer.
  const settle = async (): Promise<void> => {
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
    queryClient = createTestQueryClient();
    invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    api.participate.mockResolvedValue({ success: true });
    api.unwishEvent.mockResolvedValue({ success: true });
    api.unparticipate.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('participate', () => {
    it('takes the event out of the cached wishlist and lowers the count by one', async () => {
      queryClient.setQueryData(WISHED_KEY, wishedList(['a', 'b', 'c']));
      const { result } = render();

      await act(async () => {
        await result.current.participate('b');
      });

      const cached = queryClient.getQueryData<WishedPages>(WISHED_KEY);
      expect(cached?.pages[0]?.events.map((e) => e.id)).toEqual(['a', 'c']);
      expect(cached?.pages[0]?.totalCount).toBe(2);
    });

    it('keeps the count when the event was not in the cached wishlist', async () => {
      queryClient.setQueryData(WISHED_KEY, wishedList(['a', 'c']));
      const { result } = render();

      await act(async () => {
        await result.current.participate('not-wished');
      });

      const cached = queryClient.getQueryData<WishedPages>(WISHED_KEY);
      expect(cached?.pages[0]?.events.map((e) => e.id)).toEqual(['a', 'c']);
      expect(cached?.pages[0]?.totalCount).toBe(2);
    });

    it('reloads the wishlist from the server once participation settles', async () => {
      queryClient.setQueryData(WISHED_KEY, wishedList(['a', 'b']));
      const { result } = render();

      await act(async () => {
        await result.current.participate('b');
      });

      await settle();
      expect(exactInvalidations(invalidateSpy, ['wished-events'])).toBe(1);
    });

    it('reloads the wishlist from the server when participation fails', async () => {
      api.participate.mockRejectedValue(new Error('boom'));
      queryClient.setQueryData(WISHED_KEY, wishedList(['a', 'b']));
      const { result } = render();

      await act(async () => {
        await result.current.participate('b').catch(() => undefined);
      });

      await settle();
      expect(exactInvalidations(invalidateSpy, ['wished-events'])).toBe(1);
    });

    it('reloads the wishlist once after a burst of participations, not once per tap', async () => {
      queryClient.setQueryData(WISHED_KEY, wishedList(['a', 'b', 'c']));
      const { result } = render();

      await act(async () => {
        await Promise.all([
          result.current.participate('a'),
          result.current.participate('b'),
          result.current.participate('c'),
        ]);
      });

      await settle();
      expect(exactInvalidations(invalidateSpy, ['wished-events'])).toBe(1);
      const cached = queryClient.getQueryData<WishedPages>(WISHED_KEY);
      expect(cached?.pages[0]?.events).toEqual([]);
      expect(cached?.pages[0]?.totalCount).toBe(0);
    });
  });

  describe('participate burst on the participated list', () => {
    it('reloads the participated events once after a burst of participations, not once per tap', async () => {
      const { result } = render();

      await act(async () => {
        await Promise.all([
          result.current.participate('a'),
          result.current.participate('b'),
          result.current.participate('c'),
        ]);
      });

      await settle();
      expect(exactInvalidations(invalidateSpy, ['participated-events'])).toBe(1);
    });
  });

  describe('unwish', () => {
    it('keeps the count when the event was not in the cached wishlist', async () => {
      api.unwishEvent.mockResolvedValue({ success: true });
      queryClient.setQueryData(WISHED_KEY, wishedList(['a']));
      const { result } = render();

      await act(async () => {
        await result.current.unwish('not-wished');
      });

      expect(queryClient.getQueryData<WishedPages>(WISHED_KEY)?.pages[0]?.totalCount).toBe(1);
    });

    it('reloads the wishlist from the server once the removal settles', async () => {
      queryClient.setQueryData(WISHED_KEY, wishedList(['a', 'b']));
      const { result } = render();

      await act(async () => {
        await result.current.unwish('a');
      });

      await settle();
      expect(exactInvalidations(invalidateSpy, ['wished-events'])).toBe(1);
    });
  });

  describe('unparticipate', () => {
    it('reloads the participated events so the event leaves the list', async () => {
      const { result } = render();

      await act(async () => {
        await result.current.unparticipate('e1');
      });

      await settle();
      expect(exactInvalidations(invalidateSpy, ['participated-events'])).toBe(1);
    });
  });
});
