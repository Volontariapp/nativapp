import * as mockErrors from './errors.mock';
import * as mockClient from './client.mock';
import { authExpiredBus, syncPendingBus } from '../../services/event-bus.service';
import { apiFetch, refreshAccessToken } from '../client';
import { createAxiosError, createAxiosResponse } from './client.factory';

jest.mock('@volontariapp/errors', () => mockErrors, { virtual: true });
jest.mock('axios', () => mockClient.axiosModuleMock);
jest.mock('../../shared/config/base-config', () => ({
  config: { apiGatewayUrl: 'http://gateway', cloudflareAccess: null },
}));
jest.mock('../../services/token.service', () => mockClient.tokenServiceModuleMock);

const axiosMock = mockClient.mockAxiosRequest;
const postMock = mockClient.mockAxiosPost;
const getAccessToken = mockClient.mockGetAccessToken;
const getRefreshToken = mockClient.mockGetRefreshToken;
const saveTokens = mockClient.mockSaveTokens;

const EXPIRED = { message: 'jwt expired' };

describe('apiFetch', () => {
  let expired: jest.Mock;
  let syncPending: jest.Mock;
  let unsubscribe: Array<() => void>;

  beforeEach(() => {
    getAccessToken.mockResolvedValue('old-access');
    getRefreshToken.mockResolvedValue('refresh-token');
    expired = jest.fn();
    syncPending = jest.fn();
    unsubscribe = [authExpiredBus.subscribe(expired), syncPendingBus.subscribe(syncPending)];
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    unsubscribe.forEach((u) => {
      u();
    });
    jest.restoreAllMocks();
    axiosMock.mockReset();
    postMock.mockReset();
  });

  it('ajoute un timeout a la requete', async () => {
    axiosMock.mockResolvedValueOnce(createAxiosResponse(200, { ok: true }));

    await expect(apiFetch('/x')).resolves.toEqual({ ok: true });

    expect(axiosMock).toHaveBeenCalledWith(expect.objectContaining({ timeout: 15000 }));
  });

  it('emet syncPendingBus sur un 206 du premier appel', async () => {
    axiosMock.mockResolvedValueOnce(createAxiosResponse(206, {}));

    await apiFetch('/x');

    expect(syncPending).toHaveBeenCalledWith(true);
  });

  describe('refresh apres expiration du token', () => {
    it('retente avec le nouveau token, timeout inclus, et traite le 206 du retry', async () => {
      axiosMock
        .mockRejectedValueOnce(createAxiosError(401, EXPIRED))
        .mockResolvedValueOnce(createAxiosResponse(206, { ok: true }));
      postMock.mockResolvedValueOnce(
        createAxiosResponse(200, { auth: { accessToken: 'new-a', refreshToken: 'new-r' } }),
      );

      await expect(apiFetch('/x')).resolves.toEqual({ ok: true });

      expect(postMock).toHaveBeenCalledWith(
        'http://gateway/api/v1/users/refresh',
        { refreshToken: 'refresh-token' },
        expect.objectContaining({ timeout: 15000 }),
      );
      expect(saveTokens).toHaveBeenCalledWith('new-a', 'new-r');
      const retryConfig = axiosMock.mock.calls[1]?.[0];
      expect(retryConfig?.timeout).toBe(15000);
      expect(retryConfig?.headers).toMatchObject({ Authorization: 'Bearer new-a' });
      expect(syncPending).toHaveBeenCalledWith(true);
      expect(expired).not.toHaveBeenCalled();
    });

    it('ne deconnecte pas sur une erreur reseau du refresh', async () => {
      axiosMock.mockRejectedValueOnce(createAxiosError(401, EXPIRED));
      postMock.mockRejectedValueOnce(createAxiosError(undefined, {}, 'Network Error'));

      await expect(apiFetch('/x')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });

      expect(expired).not.toHaveBeenCalled();
    });

    it('ne deconnecte pas sur un 5xx du refresh', async () => {
      axiosMock.mockRejectedValueOnce(createAxiosError(401, EXPIRED));
      postMock.mockRejectedValueOnce(createAxiosError(503));

      await expect(apiFetch('/x')).rejects.toMatchObject({ code: '503' });

      expect(expired).not.toHaveBeenCalled();
    });

    it.each([401, 403])('deconnecte sur un %i du refresh', async (refreshStatus) => {
      axiosMock.mockRejectedValueOnce(createAxiosError(401, EXPIRED));
      postMock.mockRejectedValueOnce(createAxiosError(refreshStatus));

      await expect(apiFetch('/x')).rejects.toMatchObject({ code: '401' });

      expect(expired).toHaveBeenCalledTimes(1);
    });

    it('deconnecte quand il n y a pas de refresh token', async () => {
      getRefreshToken.mockResolvedValueOnce(null);
      axiosMock.mockRejectedValueOnce(createAxiosError(401, EXPIRED));

      await expect(apiFetch('/x')).rejects.toMatchObject({ code: '401' });

      expect(expired).toHaveBeenCalledTimes(1);
      expect(postMock).not.toHaveBeenCalled();
    });

    it('deconnecte quand la reponse du refresh est invalide', async () => {
      axiosMock.mockRejectedValueOnce(createAxiosError(401, EXPIRED));
      postMock.mockResolvedValueOnce(createAxiosResponse(200, {}));

      await expect(apiFetch('/x')).rejects.toMatchObject({ code: '401' });

      expect(expired).toHaveBeenCalledTimes(1);
    });

    it('ne deconnecte pas et propage l erreur si le retry echoue', async () => {
      axiosMock
        .mockRejectedValueOnce(createAxiosError(401, EXPIRED))
        .mockRejectedValueOnce(createAxiosError(500, { message: 'boom' }));
      postMock.mockResolvedValueOnce(
        createAxiosResponse(200, { auth: { accessToken: 'a', refreshToken: 'r' } }),
      );

      await expect(apiFetch('/x')).rejects.toMatchObject({ code: '500', message: 'boom' });

      expect(expired).not.toHaveBeenCalled();
    });
  });

  it('refreshAccessToken renvoie null sans refresh token', async () => {
    getRefreshToken.mockResolvedValueOnce(null);

    await expect(refreshAccessToken()).resolves.toBeNull();
  });
});
