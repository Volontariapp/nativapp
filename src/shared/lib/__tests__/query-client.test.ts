import { createQueryClient, isClientError, shouldRetryQuery } from '../query-client';

describe('query-client', () => {
  it('applique les options par defaut', () => {
    const options = createQueryClient().getDefaultOptions().queries;
    expect(options?.staleTime).toBe(30_000);
    expect(options?.gcTime).toBe(5 * 60_000);
    expect(options?.refetchOnReconnect).toBe(true);
    expect(options?.retry).toBe(shouldRetryQuery);
  });

  it('reconnait un 4xx via statusCode', () => {
    expect(isClientError({ statusCode: 404 })).toBe(true);
    expect(isClientError({ statusCode: 500 })).toBe(false);
    expect(isClientError(new Error('x'))).toBe(false);
    expect(isClientError(null)).toBe(false);
    expect(isClientError({ statusCode: '404' })).toBe(false);
  });

  it('ne rejoue pas un 4xx', () => {
    expect(shouldRetryQuery(0, { statusCode: 422 })).toBe(false);
  });

  it('rejoue jusqu a 2 fois les autres erreurs', () => {
    expect(shouldRetryQuery(0, new Error('reseau'))).toBe(true);
    expect(shouldRetryQuery(1, { statusCode: 503 })).toBe(true);
    expect(shouldRetryQuery(2, new Error('reseau'))).toBe(false);
  });

  it('laisse un hook surcharger staleTime et retry', () => {
    const client = createQueryClient();
    const resolved = client.defaultQueryOptions({
      queryKey: ['x'],
      staleTime: 0,
      retry: false,
    });
    expect(resolved.staleTime).toBe(0);
    expect(resolved.retry).toBe(false);
  });
});
