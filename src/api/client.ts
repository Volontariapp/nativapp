import { TokenService } from '../services/token.service';
import { authExpiredBus } from '../services/event-bus.service';
import { config } from '../config/base-config';
import axios, { type AxiosError } from 'axios';
import { createApiError } from './core/api-error.factory';
import type { FetchOptions } from './core/api.types';
import { InternalServerError } from '@volontariapp/errors';

const getApiBaseUrl = (): string => {
  const base = config.apiGatewayUrl.replace(/\/$/, '');
  return `${base}/api/v1`;
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

  const requiresAuth = options.requiresAuth ?? true;
  if (requiresAuth) {
    const token = await TokenService.getAccessToken();
    if (token !== null) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await axios({
      url,
      method: options.method ?? 'GET',
      headers,
      data: options.body,
    });

    return response.data as TResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<Record<string, unknown>>;
      const status = axiosError.response?.status ?? 500;
      const data = axiosError.response?.data ?? {};
      const message = typeof data.message === 'string' ? data.message : axiosError.message;

      if (status === 401) {
        authExpiredBus.emit();
      }

      throw createApiError(status, message, data);
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new InternalServerError(`Erreur réseau: ${message}`, 'NETWORK_ERROR');
  }
};
