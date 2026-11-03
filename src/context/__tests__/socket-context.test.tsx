import React, { act } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PROFILE_QUERY_KEY } from '@/api/user/hooks/use-profile';
import { AppState, type AppStateStatus } from 'react-native';
import { RESYNC_QUERY_KEYS, SocketProvider } from '../SocketContext';
import {
  createFakeSocket,
  mockGetAccessToken,
  mockSocketServiceConnect,
  mockSocketServiceDisconnect,
  mockUseAuth,
  type FakeSocket,
} from './socket-context.mock';

jest.mock('../AuthContext', () => ({
  useAuth: (): unknown => mockUseAuth(),
}));
jest.mock('../../services/token.service', () => ({
  TokenService: { getAccessToken: (): unknown => mockGetAccessToken() },
}));
jest.mock('../../services/socket.service', () => ({
  socketService: {
    connect: (token: string): unknown => mockSocketServiceConnect(token),
    disconnect: (): unknown => mockSocketServiceDisconnect(),
  },
}));

describe('SocketProvider', () => {
  let fakeSocket: FakeSocket;
  let queryClient: QueryClient;
  let invalidateSpy: jest.SpyInstance;
  let appStateHandler: ((state: AppStateStatus) => void) | undefined;

  beforeEach(async () => {
    appStateHandler = undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
      appStateHandler = handler;
      return { remove: jest.fn() };
    });
    fakeSocket = createFakeSocket();
    queryClient = new QueryClient();
    invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    mockGetAccessToken.mockResolvedValue('token');
    mockSocketServiceConnect.mockReturnValue(fakeSocket);

    render(
      <QueryClientProvider client={queryClient}>
        <SocketProvider>{null}</SocketProvider>
      </QueryClientProvider>,
    );
    await waitFor(() => {
      expect(fakeSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('does not invalidate the profile on the very first connect', () => {
    act(() => {
      fakeSocket.emitLocal('connect');
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('invalidates the profile when the socket reconnects after a disconnect', () => {
    act(() => {
      fakeSocket.emitLocal('connect');
      fakeSocket.emitLocal('disconnect');
      fakeSocket.emitLocal('connect');
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: PROFILE_QUERY_KEY });
  });

  it('resyncs likes, ranking, comments and likers after a reconnection', () => {
    act(() => {
      fakeSocket.emitLocal('connect');
      fakeSocket.emitLocal('disconnect');
      fakeSocket.emitLocal('connect');
    });

    expect(invalidateSpy).toHaveBeenCalledTimes(RESYNC_QUERY_KEYS.length);
    expect(RESYNC_QUERY_KEYS).toEqual(
      expect.arrayContaining([
        ['my-likes'],
        ['likes-summary'],
        ['ranking'],
        ['post-likers'],
        ['comments-list'],
      ]),
    );
    RESYNC_QUERY_KEYS.forEach((queryKey) => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey });
    });
  });

  it('reconnects the existing socket when the app returns to the foreground', () => {
    fakeSocket.connected = false;

    act(() => {
      appStateHandler?.('active');
    });

    expect(fakeSocket.connect).toHaveBeenCalledTimes(1);
    expect(mockSocketServiceConnect).toHaveBeenCalledTimes(1);
  });

  it('does not reconnect on foreground when already connected or when going to background', () => {
    fakeSocket.connected = true;
    act(() => {
      appStateHandler?.('active');
    });
    fakeSocket.connected = false;
    act(() => {
      appStateHandler?.('background');
    });

    expect(fakeSocket.connect).not.toHaveBeenCalled();
  });
});
