import React, { act } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PROFILE_QUERY_KEY } from '@/api/user/hooks/use-profile';
import { SocketProvider } from '../SocketContext';
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

  beforeEach(async () => {
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

    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: PROFILE_QUERY_KEY });
  });
});
