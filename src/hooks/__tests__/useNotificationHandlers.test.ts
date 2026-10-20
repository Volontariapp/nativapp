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
});
