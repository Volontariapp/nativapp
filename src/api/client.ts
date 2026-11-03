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

// Delai maximal d'une requete HTTP avant abandon (evite un appel suspendu hors-ligne).
const REQUEST_TIMEOUT_MS = 15000;

let refreshPromise: Promise<string | null> | null = null;

/**
 * Renouvelle l'access token a partir du refresh token et sauvegarde la nouvelle paire.
 * Les appels concurrents (API et socket) partagent la meme requete de refresh.
 * Renvoie null si aucun refresh token n'est disponible ou si la reponse est invalide ;
 * propage l'erreur axios (reseau, 401) sinon.
 */
export const refreshAccessToken = (): Promise<string | null> => {
  refreshPromise ??= (async () => {
    const currentRefreshToken = await TokenService.getRefreshToken();
    if (currentRefreshToken == null) {
      return null;
    }

    const refreshHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${currentRefreshToken}`,
    };
    const cfAccess = config.cloudflareAccess;
    if (cfAccess != null && cfAccess.clientId !== '' && cfAccess.clientSecret !== '') {
      refreshHeaders['CF-Access-Client-Id'] = cfAccess.clientId;
      refreshHeaders['CF-Access-Client-Secret'] = cfAccess.clientSecret;
    }

    const refreshRes = await axios.post(
      `${getApiBaseUrl()}/users/refresh`,
      { refreshToken: currentRefreshToken },
      { headers: refreshHeaders, timeout: REQUEST_TIMEOUT_MS },
    );

    const authData = (refreshRes.data as LoginWebResponse).auth;

    if (typeof authData?.accessToken === 'string' && typeof authData.refreshToken === 'string') {
      await TokenService.saveTokens(authData.accessToken, authData.refreshToken);
      return authData.accessToken;
    }
    console.error('[apiFetch] Refresh failed: structure de reponse invalide');
    return null;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

/**
 * Envoie la requete et traite le statut 206 (reponse degradee) de la meme facon
 * pour le premier appel et pour le retry apres refresh.
 */
const sendRequest = async <TResponse>(
  url: string,
  options: FetchOptions<unknown>,
  headers: Record<string, string>,
): Promise<TResponse> => {
  const response = await axios({
    url,
    method: options.method ?? 'GET',
    headers,
    data: options.body,
    params: options.params,
    timeout: REQUEST_TIMEOUT_MS,
  });

  if (response.status === 206) {
    syncPendingBus.emit(true);
  }

  return response.data as TResponse;
};

const toApiError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<Record<string, unknown>>;
    const data = axiosError.response?.data ?? {};
    const message = typeof data.message === 'string' ? data.message : axiosError.message;
    if (axiosError.response === undefined) {
      return new InternalServerError(`Erreur reseau: ${message}`, 'NETWORK_ERROR');
    }
    return createApiError(axiosError.response.status, message, data);
  }
  const message = error instanceof Error ? error.message : 'Unknown error';
  return new InternalServerError(`Erreur reseau: ${message}`, 'NETWORK_ERROR');
};

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
    return await sendRequest<TResponse>(url, options, headers);
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
        let newAccessToken: string | null;
        try {
          newAccessToken = await refreshAccessToken();
        } catch (refreshErr) {
          console.error('[apiFetch] Echec du refresh du token');
          if (axios.isAxiosError(refreshErr)) {
            const refreshStatus = refreshErr.response?.status;
            // Seul un refus explicite du serveur invalide la session.
            if (refreshStatus === 401 || refreshStatus === 403) {
              authExpiredBus.emit();
              throw createApiError(status, message, data);
            }
            // Erreur reseau ou 5xx : la session reste valide, l'appelant pourra retenter.
            if (refreshStatus === undefined) {
              throw new InternalServerError(
                `Erreur reseau: ${refreshErr.message}`,
                'NETWORK_ERROR',
              );
            }
            throw createApiError(refreshStatus, refreshErr.message);
          }
          const refreshMessage = refreshErr instanceof Error ? refreshErr.message : 'Unknown error';
          throw new InternalServerError(`Erreur reseau: ${refreshMessage}`, 'NETWORK_ERROR');
        }

        if (newAccessToken === null) {
          // Pas de refresh token ou reponse invalide : la session est perdue.
          authExpiredBus.emit();
          throw createApiError(status, message, data);
        }

        headers['Authorization'] = `Bearer ${newAccessToken}`;
        try {
          return await sendRequest<TResponse>(url, options, headers);
        } catch (retryError) {
          throw toApiError(retryError);
        }
      } else if ((status === 401 || status === 403) && endpoint.includes('/users/refresh')) {
        authExpiredBus.emit();
      }

      throw createApiError(status, message, data);
    }
    throw toApiError(error);
  }
};
