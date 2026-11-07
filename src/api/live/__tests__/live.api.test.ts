import { apiFetch } from '../../client';
import { LIVE_ENDPOINTS } from '../../endpoints/live.endpoints';
import { liveApi } from '../live.api';

jest.mock('../../client', () => ({
  apiFetch: jest.fn(),
}));

const apiFetchMock = jest.mocked(apiFetch);

describe('liveApi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    apiFetchMock.mockReset();
  });

  it('startSharing sends PUT /live/events/:eventId/sharing with auth and no body', async () => {
    apiFetchMock.mockResolvedValue(undefined);

    await liveApi.startSharing('evt-1');

    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    expect(apiFetchMock).toHaveBeenCalledWith('/live/events/evt-1/sharing', {
      method: 'PUT',
      requiresAuth: true,
    });
    expect(LIVE_ENDPOINTS.START_SHARING.path).toBe('/live/events/:eventId/sharing');
  });

  it.each(['ARRIVED', 'STOPPED', 'LEFT'] as const)(
    'stopSharing sends DELETE with reason %s as a query param',
    async (reason) => {
      apiFetchMock.mockResolvedValue(undefined);

      await liveApi.stopSharing('evt-1', reason);

      expect(apiFetchMock).toHaveBeenCalledWith('/live/events/evt-1/sharing', {
        method: 'DELETE',
        requiresAuth: true,
        params: { reason },
      });
    },
  );

  it('encodes the event id in the path', async () => {
    apiFetchMock.mockResolvedValue(undefined);

    await liveApi.startSharing('a/b');

    expect(apiFetchMock).toHaveBeenCalledWith('/live/events/a%2Fb/sharing', expect.any(Object));
  });

  it('propagates the error of a failed request', async () => {
    apiFetchMock.mockRejectedValue(new Error('403'));

    await expect(liveApi.startSharing('evt-1')).rejects.toThrow('403');
    await expect(liveApi.stopSharing('evt-1', 'STOPPED')).rejects.toThrow('403');
  });
});
