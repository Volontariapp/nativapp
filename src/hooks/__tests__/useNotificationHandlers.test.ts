jest.mock('@volontariapp/errors', () => ({}), { virtual: true });
jest.mock('@volontariapp/contracts', () => ({}), { virtual: true });
jest.mock('@volontariapp/shared', () => ({ UserRoles: {} }), { virtual: true });
jest.mock('@volontariapp/logger', () => ({}), { virtual: true });
jest.mock(
  '@volontariapp/messaging',
  () => ({
    WebsocketMessagingType: {
      USER_DELETED: 'USER_DELETED',
      USER_IMPACT_SCORE_CREDITED: 'USER_IMPACT_SCORE_CREDITED',
      RANKING_READY: 'ranking.ready',
      POST_LIKED: 'POST_LIKED',
      POST_UNLIKED: 'POST_UNLIKED',
      EVENT_CREATED: 'event.created',
      EVENT_DELETED: 'event.deleted',
      FALLBACK_CREATE_EVENT: 'event.fallback.create_event',
      FALLBACK_UPDATE_EVENT: 'event.fallback.update_event',
      FALLBACK_DELETE_EVENT: 'event.fallback.delete_event',
      FALLBACK_CHANGE_EVENT_STATE: 'event.fallback.change_event_state',
      FALLBACK_MANAGE_REQUIREMENTS: 'event.fallback.manage_requirements',
    },
  }),
  { virtual: true },
);

import { renderHook } from '@testing-library/react-native';
import { useNotificationHandlers } from '../useNotificationHandlers';
import { WebsocketMessagingType } from '@volontariapp/messaging';
import { PROFILE_QUERY_KEY } from '@/api/user/hooks/use-profile';
import { authExpiredBus } from '../../services/event-bus.service';
import type { Socket } from 'socket.io-client';

const mockQueryClientClear = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    clear: mockQueryClientClear,
    invalidateQueries: mockInvalidateQueries,
  }),
}));

describe('useNotificationHandlers', () => {
  let mockSocket: {
    on: jest.Mock;
    off: jest.Mock;
  };
  let listeners: Record<string, (data: unknown) => void>;
  let showNotificationMock: jest.Mock;
  let authExpiredBusEmitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    listeners = {};
    mockSocket = {
      on: jest.fn().mockImplementation((event: string, handler: (data: unknown) => void) => {
        listeners[event] = handler;
      }),
      off: jest.fn(),
    };
    showNotificationMock = jest.fn();
    authExpiredBusEmitSpy = jest.spyOn(authExpiredBus, 'emit');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should clear queryClient cache and emit authExpiredBus when USER_DELETED is received with isEmitter: true', () => {
    renderHook(() => {
      useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
    });

    const userDeletedHandler = listeners[WebsocketMessagingType.USER_DELETED];
    expect(userDeletedHandler).toBeDefined();

    userDeletedHandler?.({ isEmitter: true });

    expect(showNotificationMock).toHaveBeenCalledWith('Votre compte a été supprimé.');
    expect(mockQueryClientClear).toHaveBeenCalled();
    expect(authExpiredBusEmitSpy).toHaveBeenCalled();
  });

  it('should not clear cache or emit authExpiredBus when USER_DELETED is received with isEmitter: false', () => {
    renderHook(() => {
      useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
    });

    const userDeletedHandler = listeners[WebsocketMessagingType.USER_DELETED];
    expect(userDeletedHandler).toBeDefined();

    userDeletedHandler?.({ isEmitter: false });

    expect(showNotificationMock).toHaveBeenCalledWith('Un compte a été supprimé.');
    expect(mockQueryClientClear).not.toHaveBeenCalled();
    expect(authExpiredBusEmitSpy).not.toHaveBeenCalled();
  });

  it('should invalidate the profile and notify the increment when USER_IMPACT_SCORE_CREDITED is received', () => {
    renderHook(() => {
      useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
    });

    const handler = listeners[WebsocketMessagingType.USER_IMPACT_SCORE_CREDITED];
    expect(handler).toBeDefined();

    handler?.({ eventId: 'event-1', scoreIncrement: 40 });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: PROFILE_QUERY_KEY });
    expect(showNotificationMock).toHaveBeenCalledWith('+40 points d’impact');
  });

  it('should unsubscribe the USER_IMPACT_SCORE_CREDITED handler on unmount', () => {
    const { unmount } = renderHook(() => {
      useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
    });

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith(
      WebsocketMessagingType.USER_IMPACT_SCORE_CREDITED,
      listeners[WebsocketMessagingType.USER_IMPACT_SCORE_CREDITED],
    );
  });

  it('should debounce invalidation of ranking queries by 1 second when RANKING_READY is received', () => {
    jest.useFakeTimers();
    try {
      renderHook(() => {
        useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
      });

      const handler = listeners[WebsocketMessagingType.RANKING_READY];
      expect(handler).toBeDefined();

      handler?.({});
      expect(mockInvalidateQueries).not.toHaveBeenCalled();

      handler?.({});
      jest.advanceTimersByTime(500);
      expect(mockInvalidateQueries).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['ranking'] });
    } finally {
      jest.useRealTimers();
    }
  });

  describe('RANKING_READY list kind', () => {
    const readyKeys = (): unknown[] =>
      mockInvalidateQueries.mock.calls.map(([arg]) => (arg as { queryKey: unknown }).queryKey);

    const fire = (...payloads: unknown[]): void => {
      renderHook(() => {
        useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
      });
      const handler = listeners[WebsocketMessagingType.RANKING_READY];
      payloads.forEach((payload) => handler?.(payload));
      jest.advanceTimersByTime(1000);
    };

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('refreshes only the event list when the event list is ready', () => {
      fire({ listKind: 'EVENT' });

      expect(readyKeys()).toEqual([['ranking', 'events']]);
    });

    it('refreshes only the post feed when the feed is ready', () => {
      fire({ listKind: 'POST' });

      expect(readyKeys()).toEqual([['ranking', 'feed']]);
    });

    it('refreshes both lists when the emitter does not say which one (older emitter)', () => {
      fire({});

      expect(readyKeys()).toEqual([['ranking']]);
    });

    it('refreshes both lists when both are announced within the same second', () => {
      fire({ listKind: 'EVENT' }, { listKind: 'POST' });

      expect(readyKeys()).toEqual([['ranking']]);
    });

    it('forgets what was refreshed once the debounce fired', () => {
      renderHook(() => {
        useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
      });
      const handler = listeners[WebsocketMessagingType.RANKING_READY];

      handler?.({ listKind: 'EVENT' });
      jest.advanceTimersByTime(1000);
      handler?.({ listKind: 'POST' });
      jest.advanceTimersByTime(1000);

      expect(readyKeys()).toEqual([
        ['ranking', 'events'],
        ['ranking', 'feed'],
      ]);
    });
  });

  it('should unsubscribe the RANKING_READY handler on unmount', () => {
    const { unmount } = renderHook(() => {
      useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
    });

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith(
      WebsocketMessagingType.RANKING_READY,
      listeners[WebsocketMessagingType.RANKING_READY],
    );
  });

  it.each([
    ['POST_LIKED', WebsocketMessagingType.POST_LIKED],
    ['POST_UNLIKED', WebsocketMessagingType.POST_UNLIKED],
  ])('%s invalidates my-likes only when the current user is the emitter', (_name, eventType) => {
    renderHook(() => {
      useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
    });
    const handler = listeners[eventType];

    handler?.({ postId: 'p1', isEmitter: false });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['post-likers', 'p1'] });
    expect(
      mockInvalidateQueries.mock.calls.some(
        ([arg]) => typeof arg === 'object' && arg !== null && 'predicate' in arg,
      ),
    ).toBe(true);
    expect(mockInvalidateQueries).not.toHaveBeenCalledWith({ queryKey: ['my-likes'] });

    handler?.({ postId: 'p1', isEmitter: true });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['my-likes'] });
  });

  describe('event lists', () => {
    const EVENT_LIST_KEYS = [['events'], ['my-events'], ['wished-events'], ['participated-events']];

    const invalidatedKeys = (): unknown[] =>
      mockInvalidateQueries.mock.calls.map(([arg]) => (arg as { queryKey: unknown }).queryKey);

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('refreshes the event lists when someone else creates an event', () => {
      renderHook(() => {
        useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
      });

      listeners[WebsocketMessagingType.EVENT_CREATED]?.({ eventId: 'e1', isEmitter: false });
      jest.advanceTimersByTime(500);

      expect(invalidatedKeys()).toEqual(expect.arrayContaining(EVENT_LIST_KEYS));
    });

    it('still shows the toast when an event is created', () => {
      renderHook(() => {
        useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
      });

      listeners[WebsocketMessagingType.EVENT_CREATED]?.({ eventId: 'e1', isEmitter: false });

      expect(showNotificationMock).toHaveBeenCalledWith("Un nouvel évènement vient d'être publié !");
    });

    it('refreshes the lists, the detail and the ranking when an event is deleted', () => {
      renderHook(() => {
        useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
      });

      listeners[WebsocketMessagingType.EVENT_DELETED]?.({ eventId: 'e1', isEmitter: false });
      jest.advanceTimersByTime(500);

      expect(invalidatedKeys()).toEqual(
        expect.arrayContaining([...EVENT_LIST_KEYS, ['event', 'e1'], ['ranking']]),
      );
    });

    it('coalesces a burst of events into one refresh of each list', () => {
      renderHook(() => {
        useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
      });

      for (let i = 0; i < 20; i += 1) {
        listeners[WebsocketMessagingType.EVENT_CREATED]?.({ eventId: `e${String(i)}` });
      }
      jest.advanceTimersByTime(500);

      expect(invalidatedKeys().filter((key) => String(key) === 'events')).toHaveLength(1);
    });

    it.each([
      ['FALLBACK_CREATE_EVENT', WebsocketMessagingType.FALLBACK_CREATE_EVENT],
      ['FALLBACK_UPDATE_EVENT', WebsocketMessagingType.FALLBACK_UPDATE_EVENT],
      ['FALLBACK_DELETE_EVENT', WebsocketMessagingType.FALLBACK_DELETE_EVENT],
      ['FALLBACK_CHANGE_EVENT_STATE', WebsocketMessagingType.FALLBACK_CHANGE_EVENT_STATE],
      ['FALLBACK_MANAGE_REQUIREMENTS', WebsocketMessagingType.FALLBACK_MANAGE_REQUIREMENTS],
    ])('%s refreshes the event lists once the change was applied', (_name, eventType) => {
      renderHook(() => {
        useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
      });

      listeners[eventType]?.({ status: 'SUCCESS' });
      jest.advanceTimersByTime(500);

      expect(invalidatedKeys()).toEqual(expect.arrayContaining(EVENT_LIST_KEYS));
    });

    it('leaves the lists alone when a fallback change failed', () => {
      renderHook(() => {
        useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
      });

      listeners[WebsocketMessagingType.FALLBACK_CREATE_EVENT]?.({ status: 'FAILED' });
      jest.advanceTimersByTime(500);

      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });

    it('does not refresh anything after unmount', () => {
      const { unmount } = renderHook(() => {
        useNotificationHandlers(mockSocket as unknown as Socket, showNotificationMock);
      });
      listeners[WebsocketMessagingType.EVENT_CREATED]?.({ eventId: 'e1' });

      unmount();
      jest.advanceTimersByTime(500);

      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
  });
});
