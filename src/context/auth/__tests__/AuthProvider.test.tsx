import React, { act } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@volontariapp/errors', () => ({}), { virtual: true });
jest.mock('@volontariapp/shared', () => ({}), { virtual: true });

import { AuthProvider } from '../AuthProvider';
import { TokenService } from '../../../services/token.service';
import * as client from '../../../api/client';
import * as jwtDecodeModule from 'jwt-decode';
import { AuthContext } from '../auth.context';

export const contextSpy = jest.fn();

const renderProvider = (queryClient: QueryClient): void => {
  void render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </QueryClientProvider>,
  );
};

const TestComponent = () => {
  const context = React.useContext(AuthContext);
  contextSpy(context);
  return null;
};

describe('AuthProvider', () => {
  let getAccessTokenSpy: jest.SpyInstance;
  let getRefreshTokenSpy: jest.SpyInstance;
  let saveTokensSpy: jest.SpyInstance;
  let clearTokensSpy: jest.SpyInstance;
  let apiFetchSpy: jest.SpyInstance;
  let jwtDecodeSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    getAccessTokenSpy = jest.spyOn(TokenService, 'getAccessToken');
    getRefreshTokenSpy = jest.spyOn(TokenService, 'getRefreshToken');
    saveTokensSpy = jest.spyOn(TokenService, 'saveTokens').mockResolvedValue(undefined);
    clearTokensSpy = jest.spyOn(TokenService, 'clearTokens').mockResolvedValue(undefined);

    apiFetchSpy = jest.spyOn(client, 'apiFetch');
    jwtDecodeSpy = jest.spyOn(jwtDecodeModule, 'jwtDecode');
    contextSpy.mockClear();
  });

  it('should refresh token if access token is expired but refresh token is valid', async () => {
    getAccessTokenSpy.mockResolvedValue('expired-access-token');
    getRefreshTokenSpy.mockResolvedValue('valid-refresh-token');

    jwtDecodeSpy.mockImplementation((token: string) => {
      if (token === 'expired-access-token') {
        return { exp: Date.now() / 1000 - 3600, id: 'user-1', sub: 'user-1' }; // Expired 1 hour ago
      }
      if (token === 'valid-refresh-token') {
        return { exp: Date.now() / 1000 + 3600, id: 'user-1', sub: 'user-1' }; // Valid for 1 hour
      }
      if (token === 'new-access-token') {
        return { exp: Date.now() / 1000 + 3600, id: 'user-1', sub: 'user-1', role: 'admin' };
      }
      return {};
    });

    apiFetchSpy.mockResolvedValue({
      auth: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
    });

    renderProvider(new QueryClient());

    expect(contextSpy).toHaveBeenCalledWith(expect.objectContaining({ isLoading: true }));

    await waitFor(
      () => {
        expect(contextSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            isAuthenticated: true,
            isLoading: false,
          }),
        );
      },
      { timeout: 15000 },
    );

    expect(apiFetchSpy).toHaveBeenCalledWith('/users/refresh', {
      method: 'POST',
      requiresAuth: false,
      headers: { Authorization: 'Bearer valid-refresh-token' },
      body: { refreshToken: 'valid-refresh-token' },
    });

    expect(saveTokensSpy).toHaveBeenCalledWith('new-access-token', 'new-refresh-token');
  }, 30000);

  it('should logout if both tokens are expired', async () => {
    getAccessTokenSpy.mockResolvedValue('expired-access-token');
    getRefreshTokenSpy.mockResolvedValue('expired-refresh-token');

    jwtDecodeSpy.mockImplementation(() => {
      return { exp: Date.now() / 1000 - 3600, id: 'user-1', sub: 'user-1' }; // Both expired
    });

    renderProvider(new QueryClient());

    await waitFor(
      () => {
        expect(contextSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            isAuthenticated: false,
            isLoading: false,
          }),
        );
      },
      { timeout: 15000 },
    );

    expect(apiFetchSpy).not.toHaveBeenCalled();
    expect(clearTokensSpy).toHaveBeenCalled();
  });

  it('clears cached server data on logout so the next account never sees the previous one', async () => {
    getAccessTokenSpy.mockResolvedValue('access-token');
    getRefreshTokenSpy.mockResolvedValue('refresh-token');
    jwtDecodeSpy.mockReturnValue({ exp: Date.now() / 1000 + 3600, id: 'user-1', sub: 'user-1' });
    const queryClient = new QueryClient();
    queryClient.setQueryData(['wished-events', { limit: 10 }], { pages: [{ events: [] }] });

    renderProvider(queryClient);
    await waitFor(() => {
      expect(contextSpy).toHaveBeenCalledWith(expect.objectContaining({ isAuthenticated: true }));
    });
    const lastCall = contextSpy.mock.calls.at(-1) as [{ logout: () => Promise<void> }];

    await act(async () => {
      await lastCall[0].logout();
    });

    expect(queryClient.getQueryData(['wished-events', { limit: 10 }])).toBeUndefined();
  });
});
