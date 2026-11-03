import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// Fonctions autonomes (et non des methodes d'objet) : elles se referencent dans les tests
// sans declencher la regle unbound-method.
export const mockAxiosRequest = jest.fn<Promise<AxiosResponse>, [AxiosRequestConfig]>();
export const mockAxiosPost = jest.fn<
  Promise<AxiosResponse>,
  [string, unknown, AxiosRequestConfig]
>();
export const mockGetAccessToken = jest.fn<Promise<string | null>, []>();
export const mockGetRefreshToken = jest.fn<Promise<string | null>, []>();
export const mockSaveTokens = jest.fn<Promise<void>, [string, string]>();

export const axiosModuleMock = {
  __esModule: true,
  default: Object.assign(mockAxiosRequest, {
    post: mockAxiosPost,
    isAxiosError: (e: unknown): boolean =>
      typeof e === 'object' &&
      e !== null &&
      (e as { isAxiosError?: boolean }).isAxiosError === true,
  }),
};

export const tokenServiceModuleMock = {
  TokenService: {
    getAccessToken: mockGetAccessToken,
    getRefreshToken: mockGetRefreshToken,
    saveTokens: mockSaveTokens,
  },
};
