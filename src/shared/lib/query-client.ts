import { QueryClient } from '@tanstack/react-query';

const STALE_TIME_MS = 30_000;
const GC_TIME_MS = 5 * 60_000;
const MAX_RETRIES = 2;

// Les erreurs de l'API (BaseApiError de @volontariapp/errors) portent un statusCode.
// Detection structurelle: pas d'import runtime du paquet (mocke vide dans jest.setup.js).
const getStatusCode = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) {
    return undefined;
  }
  const { statusCode } = error;
  return typeof statusCode === 'number' ? statusCode : undefined;
};

export const isClientError = (error: unknown): boolean => {
  const status = getStatusCode(error);
  return status !== undefined && status >= 400 && status < 500;
};

// Pas de retry sur un 4xx: la requete est invalide, la rejouer ne changera rien.
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
  if (isClientError(error)) {
    return false;
  }
  return failureCount < MAX_RETRIES;
};

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        gcTime: GC_TIME_MS,
        retry: shouldRetryQuery,
        refetchOnReconnect: true,
      },
    },
  });
