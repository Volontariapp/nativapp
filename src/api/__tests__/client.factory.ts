import type { AxiosError, AxiosResponse } from 'axios';

export const createAxiosResponse = (status: number, data: unknown = {}): AxiosResponse =>
  ({ status, data }) as AxiosResponse;

// Erreur axios minimale : isAxiosError (mock) se base sur isAxiosError === true.
export const createAxiosError = (
  status: number | undefined,
  data: Record<string, unknown> = {},
  message = 'axios error',
): AxiosError<Record<string, unknown>> => {
  const error = new Error(message) as AxiosError<Record<string, unknown>>;
  error.isAxiosError = true;
  if (status !== undefined) {
    error.response = { status, data } as AxiosResponse<Record<string, unknown>>;
  }
  return error;
};
