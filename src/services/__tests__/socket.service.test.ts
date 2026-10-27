import { AxiosError } from 'axios';
import { authExpiredBus } from '../event-bus.service';
import { socketService } from '../socket.service';
import { createJwt } from './jwt.factory';
import {
  createFakeManagerSocket,
  mockGetAccessToken,
  mockIo,
  mockRefreshAccessToken,
  type FakeManagerSocket,
} from './socket-service.mock';

jest.mock('socket.io-client', () => ({
  io: (...args: unknown[]): unknown => mockIo(...args),
}));
jest.mock('../../api/client', () => ({
  refreshAccessToken: (): unknown => mockRefreshAccessToken(),
}));
jest.mock('../token.service', () => ({
  TokenService: { getAccessToken: (): unknown => mockGetAccessToken() },
}));
jest.mock('../../shared/config/base-config', () => ({
  config: { apiGatewayUrl: 'http://gateway.test', cloudflareAccess: null },
}));

const flushPromises = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setImmediate(resolve);
  });
};

const createHttpError = (status: number): AxiosError =>
  Object.assign(new AxiosError('request failed'), { response: { status } });

describe('SocketService reconnection', () => {
  const expiredToken = createJwt(-60);
  const validToken = createJwt(3600);
  let fakeSocket: FakeManagerSocket;
  let authExpiredListener: jest.Mock;
  let unsubscribe: () => void;

  beforeEach(() => {
    fakeSocket = createFakeManagerSocket();
    mockIo.mockReturnValue(fakeSocket);
    authExpiredListener = jest.fn();
    unsubscribe = authExpiredBus.subscribe(() => {
      authExpiredListener();
    });
    socketService.connect(expiredToken);
  });

  afterEach(() => {
    unsubscribe();
    socketService.disconnect();
    jest.resetAllMocks();
  });

  it('refreshes an expired token and injects it in the next reconnection attempt', async () => {
    mockGetAccessToken.mockResolvedValue(expiredToken);
    mockRefreshAccessToken.mockResolvedValue('fresh-token');

    fakeSocket.emitLocal('connect_error');
    await flushPromises();

    expect(mockRefreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fakeSocket.io.opts.query).toEqual({ token: 'fresh-token' });
    expect(fakeSocket.io.opts.extraHeaders).toMatchObject({
      Authorization: 'Bearer fresh-token',
    });
  });

  it('reuses a still valid stored token without calling the refresh endpoint', async () => {
    mockGetAccessToken.mockResolvedValue(validToken);

    fakeSocket.emitLocal('connect_error');
    await flushPromises();

    expect(mockRefreshAccessToken).not.toHaveBeenCalled();
    expect(fakeSocket.io.opts.query).toEqual({ token: validToken });
  });

  it('shares a single refresh between concurrent connection errors', async () => {
    mockGetAccessToken.mockResolvedValue(expiredToken);
    mockRefreshAccessToken.mockResolvedValue('fresh-token');

    fakeSocket.emitLocal('connect_error');
    fakeSocket.emitLocal('connect_error');
    await flushPromises();

    expect(mockRefreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it('disconnects and signals an expired session when no refresh token is available', async () => {
    mockGetAccessToken.mockResolvedValue(expiredToken);
    mockRefreshAccessToken.mockResolvedValue(null);

    fakeSocket.emitLocal('connect_error');
    await flushPromises();

    expect(fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(authExpiredListener).toHaveBeenCalledTimes(1);
  });

  it('disconnects and signals an expired session when the refresh endpoint rejects with 401', async () => {
    mockGetAccessToken.mockResolvedValue(expiredToken);
    mockRefreshAccessToken.mockRejectedValue(createHttpError(401));

    fakeSocket.emitLocal('connect_error');
    await flushPromises();

    expect(fakeSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(authExpiredListener).toHaveBeenCalledTimes(1);
  });

  it('keeps retrying without ending the session on a network failure', async () => {
    mockGetAccessToken.mockResolvedValue(expiredToken);
    mockRefreshAccessToken.mockRejectedValue(new AxiosError('Network Error'));

    fakeSocket.emitLocal('connect_error');
    await flushPromises();

    expect(fakeSocket.disconnect).not.toHaveBeenCalled();
    expect(authExpiredListener).not.toHaveBeenCalled();
  });
});
