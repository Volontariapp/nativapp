import { TokenService } from '../services/token.service';
import { authExpiredBus, syncPendingBus } from '../services/event-bus.service';
import { config } from '../shared/config/base-config';
import axios, { type AxiosError } from 'axios';
import { createApiError } from './core/api-error.factory';
import type { FetchOptions } from './core/api.types';
import { InternalServerError } from '@volontariapp/errors';
import type { LoginWebResponse } from '@volontariapp/contracts';

const getApiBaseUrl = (): string => {
  const base = config.apiGatewayUrl.replace(/\/$/, '');
  return `${base}/api/v1`;
};

let refreshPromise: Promise<string | null> | null = null;

export const apiFetch = async <TResponse, TRequest = undefined>(
  endpoint: string,
  options: FetchOptions<TRequest> = {},
): Promise<TResponse> => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers ?? {}),
  };

  const cfAccess = config.cloudflareAccess;
  if (cfAccess != null && cfAccess.clientId !== '' && cfAccess.clientSecret !== '') {
    headers['CF-Access-Client-Id'] = cfAccess.clientId;
    headers['CF-Access-Client-Secret'] = cfAccess.clientSecret;
  }

  const requiresAuth = options.requiresAuth ?? true;
  if (requiresAuth) {
    const token = await TokenService.getAccessToken();
    if (token !== null) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    console.log(`[apiFetch] Requesting URL: ${url}`);

    const response = await axios({
      url,
      method: options.method ?? 'GET',
      headers,
      data: options.body,
      params: options.params,
    });

    if (response.status === 206) {
      syncPendingBus.emit(true);
    }

    return response.data as TResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<Record<string, unknown>>;
      const status = axiosError.response?.status ?? 500;
      const data = axiosError.response?.data ?? {};
      const message = typeof data.message === 'string' ? data.message : axiosError.message;

      const errorString = JSON.stringify(data);
      const isTokenExpiredError =
        errorString.includes('UnauthorizedError') ||
        errorString.includes('"exp" claim timestamp check failed');

      // Handle token refresh logic
      const isTokenRelated403 =
        status === 403 && typeof message === 'string' && message.toLowerCase().includes('token');
      if (
        (status === 401 || isTokenRelated403 || isTokenExpiredError) &&
        !endpoint.includes('/users/refresh')
      ) {
        const refreshToken = await TokenService.getRefreshToken();
        if (refreshToken !== null) {
          try {
            refreshPromise ??= (async () => {
              const refreshUrl = `${baseUrl}/users/refresh`;
              const refreshHeaders = { ...headers };
              refreshHeaders['Authorization'] = `Bearer ${refreshToken}`;

              console.log('[apiFetch] Attempting to refresh token...');
              console.log('[apiFetch] Refresh URL:', refreshUrl);
              console.log('[apiFetch] Refresh Headers:', JSON.stringify(refreshHeaders));

              const refreshRes = await axios.post(
                refreshUrl,
                { refreshToken },
                { headers: refreshHeaders },
              );

              console.log('[apiFetch] Refresh token response status:', refreshRes.status);
              console.log(
                '[apiFetch] Refresh token response data:',
                JSON.stringify(refreshRes.data),
              );

              const authData = (refreshRes.data as LoginWebResponse).auth;

              if (
                typeof authData?.accessToken === 'string' &&
                typeof authData.refreshToken === 'string'
              ) {
                console.log('[apiFetch] Refresh successful, saving new tokens');
                await TokenService.saveTokens(authData.accessToken, authData.refreshToken);
                return authData.accessToken;
              }
              console.log('[apiFetch] Refresh failed: Invalid auth data structure', authData);
              return null;
            })().finally(() => {
              refreshPromise = null;
            });

            const newAccessToken = await refreshPromise;

            if (newAccessToken !== null) {
              headers['Authorization'] = `Bearer ${newAccessToken}`;
              const retryRes = await axios({
                url,
                method: options.method ?? 'GET',
                headers,
                data: options.body,
                params: options.params,
              });
              return retryRes.data as TResponse;
            }
          } catch (refreshErr) {
            console.error('[apiFetch] Failed to refresh token. Error:', refreshErr);
            if (axios.isAxiosError(refreshErr)) {
              console.error('[apiFetch] Refresh error response:', refreshErr.response?.data);
            }
          }
        }

        // If refresh failed or no refresh token, emit auth expired
        authExpiredBus.emit();
      }

      throw createApiError(status, message, data);
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new InternalServerError(`Erreur réseau: ${message}`, 'NETWORK_ERROR');
  }
};
