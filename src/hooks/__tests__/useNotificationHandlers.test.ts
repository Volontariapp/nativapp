jest.mock('@volontariapp/errors', () => ({}), { virtual: true });
jest.mock('@volontariapp/contracts', () => ({}), { virtual: true });
jest.mock('@volontariapp/shared', () => ({ UserRoles: {} }), { virtual: true });
jest.mock('@volontariapp/logger', () => ({}), { virtual: true });
jest.mock(
  '@volontariapp/messaging',
  () => ({
    WebsocketMessagingType: {
      USER_DELETED: 'USER_DELETED',
    },
  }),
  { virtual: true },
);

import { renderHook } from '@testing-library/react-native';
import { useNotificationHandlers } from '../useNotificationHandlers';
import { WebsocketMessagingType } from '@volontariapp/messaging';
import { authExpiredBus } from '../../services/event-bus.service';
import type { Socket } from 'socket.io-client';

const mockQueryClientClear = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    clear: mockQueryClientClear,
    invalidateQueries: jest.fn(),
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
});
