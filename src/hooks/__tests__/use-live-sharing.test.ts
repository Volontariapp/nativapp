import { act } from 'react';
import { cleanup, renderHook } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { LiveWebsocketMessagingType } from '@volontariapp/messaging';
import { liveApi } from '@/api/live/live.api';
import { useSocket } from '@/context/SocketContext';
import { socketService } from '@/services/socket.service';
import { useLiveSharing } from '../use-live-sharing';
import { createMockPermissionResponse } from './expo-location.mock';
import {
  createFakeSocket,
  createWatchImplementation,
  spyOnAppState,
  type FakeAppState,
  type FakeSocket,
  type WatchRegistry,
} from './live-sharing.mock';
import {
  createLiveSharingTarget,
  FAR_RAW_POSITION,
  LIVE_EVENT_ID,
  NEAR_RAW_POSITION,
} from './live-sharing.factory';

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' },
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));
jest.mock('@/api/client', () => ({ apiFetch: jest.fn() }));
jest.mock('@/context/SocketContext', () => ({ useSocket: jest.fn() }));
jest.mock('@/services/socket.service', () => ({ socketService: { getSocket: jest.fn() } }));

const requestPermission = jest.mocked(Location.requestForegroundPermissionsAsync);
const watchPosition = jest.mocked(Location.watchPositionAsync);
const useSocketMock = jest.mocked(useSocket);
const socketServiceMock = jest.mocked(socketService);

interface Harness {
  fake: FakeSocket;
  watch: WatchRegistry;
  appState: FakeAppState;
  startSharing: jest.SpyInstance;
  stopSharing: jest.SpyInstance;
}

const setup = (): Harness => {
  const fake = createFakeSocket();
  const watch: WatchRegistry = { current: null };
  useSocketMock.mockReturnValue({ socket: fake.socket, isConnected: true });
  socketServiceMock.getSocket.mockReturnValue(fake.socket);
  requestPermission.mockResolvedValue(createMockPermissionResponse(true));
  watchPosition.mockImplementation(createWatchImplementation(watch));
  return {
    fake,
    watch,
    appState: spyOnAppState(),
    startSharing: jest.spyOn(liveApi, 'startSharing').mockResolvedValue(undefined),
    stopSharing: jest.spyOn(liveApi, 'stopSharing').mockResolvedValue(undefined),
  };
};

const startSharingNow = async (result: { current: ReturnType<typeof useLiveSharing> }) => {
  await act(async () => {
    await result.current.start(createLiveSharingTarget());
  });
};

describe('useLiveSharing', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
    requestPermission.mockReset();
    watchPosition.mockReset();
    useSocketMock.mockReset();
    socketServiceMock.getSocket.mockReset();
  });

  it('is idle by default and neither asks permission nor calls the API', () => {
    const { startSharing, watch } = setup();

    const { result } = renderHook(() => useLiveSharing());

    expect(result.current.status).toBe('idle');
    expect(result.current.activeEventId).toBeNull();
    expect(requestPermission).not.toHaveBeenCalled();
    expect(startSharing).not.toHaveBeenCalled();
    expect(watch.current).toBeNull();
  });

  it('calls PUT then starts a foreground watch every 30 seconds', async () => {
    const { startSharing, watch } = setup();
    const { result } = renderHook(() => useLiveSharing());

    await startSharingNow(result);

    expect(startSharing).toHaveBeenCalledWith(LIVE_EVENT_ID);
    expect(watchPosition).toHaveBeenCalledTimes(1);
    expect(watchPosition.mock.calls[0]?.[0]).toEqual({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 30000,
      distanceInterval: 0,
    });
    expect(startSharing.mock.invocationCallOrder[0]).toBeLessThan(
      watchPosition.mock.invocationCallOrder[0] ?? 0,
    );
    expect(watch.current).not.toBeNull();
    expect(result.current.status).toBe('sharing');
    expect(result.current.activeEventId).toBe(LIVE_EVENT_ID);
  });

  it('emits live.position with coordinates rounded to 3 decimals', async () => {
    const { fake, watch } = setup();
    const { result } = renderHook(() => useLiveSharing());
    await startSharingNow(result);

    act(() => {
      watch.current?.pushPosition(FAR_RAW_POSITION.latitude, FAR_RAW_POSITION.longitude);
    });

    expect(fake.emit).toHaveBeenCalledTimes(1);
    expect(fake.emit).toHaveBeenCalledWith('live.position', {
      eventId: LIVE_EVENT_ID,
      latitude: 48.857,
      longitude: 2.352,
    });
  });

  it('does not emit twice within 30 seconds', async () => {
    const { fake, watch } = setup();
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    const { result } = renderHook(() => useLiveSharing());
    await startSharingNow(result);

    act(() => {
      watch.current?.pushPosition(FAR_RAW_POSITION.latitude, FAR_RAW_POSITION.longitude);
    });
    now.mockReturnValue(1_010_000);
    act(() => {
      watch.current?.pushPosition(FAR_RAW_POSITION.latitude, FAR_RAW_POSITION.longitude);
    });
    expect(fake.emit).toHaveBeenCalledTimes(1);

    now.mockReturnValue(1_031_000);
    act(() => {
      watch.current?.pushPosition(FAR_RAW_POSITION.latitude, FAR_RAW_POSITION.longitude);
    });
    expect(fake.emit).toHaveBeenCalledTimes(2);
  });

  it('emits nothing within the arrival radius and stops with ARRIVED', async () => {
    const { fake, watch, stopSharing } = setup();
    const { result } = renderHook(() => useLiveSharing());
    await startSharingNow(result);

    await act(async () => {
      watch.current?.pushPosition(NEAR_RAW_POSITION.latitude, NEAR_RAW_POSITION.longitude);
      await Promise.resolve();
    });

    expect(fake.emit).not.toHaveBeenCalled();
    expect(stopSharing).toHaveBeenCalledWith(LIVE_EVENT_ID, 'ARRIVED');
    expect(watch.current?.remove).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('idle');
    expect(result.current.lastStop).toEqual({ eventId: LIVE_EVENT_ID, reason: 'ARRIVED' });
  });

  it('stops on live.sharing_stopped without sending a DELETE', async () => {
    const { fake, watch, stopSharing } = setup();
    const { result } = renderHook(() => useLiveSharing());
    await startSharingNow(result);

    await act(async () => {
      fake.trigger(LiveWebsocketMessagingType.LIVE_SHARING_STOPPED, {
        eventId: LIVE_EVENT_ID,
        userId: 'user-1',
        reason: 'EVENT_ENDED',
      });
      await Promise.resolve();
    });

    expect(stopSharing).not.toHaveBeenCalled();
    expect(watch.current?.remove).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('idle');
    expect(result.current.lastStop).toEqual({ eventId: LIVE_EVENT_ID, reason: 'EVENT_ENDED' });
  });

  it('ignores live.sharing_stopped for another event', async () => {
    const { fake } = setup();
    const { result } = renderHook(() => useLiveSharing());
    await startSharingNow(result);

    await act(async () => {
      fake.trigger(LiveWebsocketMessagingType.LIVE_SHARING_STOPPED, {
        eventId: 'other-event',
        userId: 'user-1',
        reason: 'REVOKED',
      });
      await Promise.resolve();
    });

    expect(result.current.status).toBe('sharing');
  });

  it('stops with STOPPED when the app leaves the foreground', async () => {
    const { appState, stopSharing, watch } = setup();
    const { result } = renderHook(() => useLiveSharing());
    await startSharingNow(result);

    await act(async () => {
      appState.setState('background');
      await Promise.resolve();
    });

    expect(stopSharing).toHaveBeenCalledWith(LIVE_EVENT_ID, 'STOPPED');
    expect(watch.current?.remove).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('idle');
  });

  it('stops with STOPPED on unmount', async () => {
    const { stopSharing, watch, appState } = setup();
    const { result, unmount } = renderHook(() => useLiveSharing());
    await startSharingNow(result);

    unmount();

    expect(stopSharing).toHaveBeenCalledWith(LIVE_EVENT_ID, 'STOPPED');
    expect(watch.current?.remove).toHaveBeenCalledTimes(1);
    expect(appState.remove).toHaveBeenCalled();
  });

  it('stops with STOPPED when the watch fails (permission removed)', async () => {
    const { watch, stopSharing } = setup();
    const { result } = renderHook(() => useLiveSharing());
    await startSharingNow(result);

    await act(async () => {
      watch.current?.fail();
      await Promise.resolve();
    });

    expect(stopSharing).toHaveBeenCalledWith(LIVE_EVENT_ID, 'STOPPED');
    expect(result.current.status).toBe('idle');
  });

  it('stops with STOPPED when watchPositionAsync rejects, after the PUT', async () => {
    const { stopSharing } = setup();
    watchPosition.mockRejectedValue(new Error('no gps'));
    const { result } = renderHook(() => useLiveSharing());

    await startSharingNow(result);

    expect(stopSharing).toHaveBeenCalledWith(LIVE_EVENT_ID, 'STOPPED');
    expect(result.current.status).toBe('error');
  });

  it('does not call PUT when the permission is denied', async () => {
    const { startSharing, stopSharing } = setup();
    requestPermission.mockResolvedValue(createMockPermissionResponse(false));
    const { result } = renderHook(() => useLiveSharing());

    await startSharingNow(result);

    expect(startSharing).not.toHaveBeenCalled();
    expect(stopSharing).not.toHaveBeenCalled();
    expect(result.current.status).toBe('error');
  });

  it('goes to error without watching when the PUT fails', async () => {
    const { startSharing, stopSharing } = setup();
    startSharing.mockRejectedValue(new Error('403'));
    const { result } = renderHook(() => useLiveSharing());

    await startSharingNow(result);

    expect(watchPosition).not.toHaveBeenCalled();
    expect(stopSharing).not.toHaveBeenCalled();
    expect(result.current.status).toBe('error');
  });

  it('sends DELETE with LEFT when the caller leaves the event', async () => {
    const { stopSharing } = setup();
    const { result } = renderHook(() => useLiveSharing());
    await startSharingNow(result);

    await act(async () => {
      await result.current.stop('LEFT');
    });

    expect(stopSharing).toHaveBeenCalledWith(LIVE_EVENT_ID, 'LEFT');
    expect(result.current.lastStop).toEqual({ eventId: LIVE_EVENT_ID, reason: 'LEFT' });
  });

  it('sends the DELETE once the PUT lands when stopped while starting', async () => {
    const { startSharing, stopSharing } = setup();
    let resolvePut: () => void = () => undefined;
    startSharing.mockImplementation(
      async () =>
        new Promise<void>((resolve) => {
          resolvePut = resolve;
        }),
    );
    const { result } = renderHook(() => useLiveSharing());

    let pending: Promise<void> = Promise.resolve();
    await act(async () => {
      pending = result.current.start(createLiveSharingTarget());
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      await result.current.stop('STOPPED');
    });
    expect(stopSharing).not.toHaveBeenCalled();
    await act(async () => {
      resolvePut();
      await pending;
    });

    expect(stopSharing).toHaveBeenCalledWith(LIVE_EVENT_ID, 'STOPPED');
    expect(watchPosition).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });

  it('resubscribes to the new socket after a reconnection', async () => {
    const first = setup();
    const { result, rerender } = renderHook(() => useLiveSharing());
    await startSharingNow(result);
    expect(first.fake.listenerCount('live.sharing_stopped')).toBe(1);

    const second = createFakeSocket();
    useSocketMock.mockReturnValue({ socket: second.socket, isConnected: true });
    socketServiceMock.getSocket.mockReturnValue(second.socket);
    rerender({});

    expect(first.fake.listenerCount('live.sharing_stopped')).toBe(0);
    expect(second.listenerCount('live.sharing_stopped')).toBe(1);

    await act(async () => {
      second.trigger('live.sharing_stopped', {
        eventId: LIVE_EVENT_ID,
        userId: 'user-1',
        reason: 'REVOKED',
      });
      await Promise.resolve();
    });
    expect(result.current.status).toBe('idle');

    await startSharingNow(result);
    act(() => {
      first.watch.current?.pushPosition(48.85666, 2.35222);
    });
    expect(second.emit).toHaveBeenCalledTimes(1);
    expect(first.fake.emit).not.toHaveBeenCalled();
  });

  it('writes no coordinate to the console', async () => {
    const { watch } = setup();
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) =>
      jest.spyOn(console, method).mockImplementation(() => undefined),
    );
    const { result } = renderHook(() => useLiveSharing());
    await startSharingNow(result);

    await act(async () => {
      watch.current?.pushPosition(FAR_RAW_POSITION.latitude, FAR_RAW_POSITION.longitude);
      watch.current?.pushPosition(NEAR_RAW_POSITION.latitude, NEAR_RAW_POSITION.longitude);
      await Promise.resolve();
    });

    const logged = JSON.stringify(spies.flatMap((spy) => spy.mock.calls));
    expect(logged).not.toContain('48.85');
    expect(logged).not.toContain('2.35');
    expect(logged).not.toContain('48.86');
  });
});
