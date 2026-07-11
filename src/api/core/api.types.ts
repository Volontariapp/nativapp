export interface FetchOptions<TRequest> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: TRequest;
  requiresAuth?: boolean;
  params?: Record<string, unknown>;
}
