import { act } from 'react';
import { cleanup, renderHook } from '@testing-library/react-native';
import { LiveWebsocketMessagingType } from '@volontariapp/messaging';
import { LIVE_POSITION_STALE_MS } from '@/api/event/live-events.utils';
import { useSocket } from '@/context/SocketContext';
import { useLiveOrganizerPositions } from '../use-live-organizer-positions';
import { createFakeSocket, type FakeSocket } from './live-sharing.mock';
import {
  createParticipantPosition,
  createPositionsPayload,
  createStoppedPayload,
  ORGANIZER_EVENT_ID,
} from './live-organizer.factory';

jest.mock('@/context/SocketContext', () => ({ useSocket: jest.fn() }));

const useSocketMock = jest.mocked(useSocket);
const POSITIONS = LiveWebsocketMessagingType.LIVE_POSITIONS_UPDATED;
const STOPPED = LiveWebsocketMessagingType.LIVE_SHARING_STOPPED;

const connect = (fake: FakeSocket): void => {
  useSocketMock.mockReturnValue({ socket: fake.socket, isConnected: true });
};

const userIds = (result: { current: { positions: { userId: string }[] } }): string[] =>
  result.current.positions.map((position) => position.userId).sort();

describe('useLiveOrganizerPositions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-07T12:00:00.000Z'));
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('starts with an empty table', () => {
    connect(createFakeSocket());
    const { result } = renderHook(() => useLiveOrganizerPositions(ORGANIZER_EVENT_ID, true));
    expect(result.current.positions).toEqual([]);
  });

  it('adds a position and replaces it on the next update of the same user', () => {
    const fake = createFakeSocket();
    connect(fake);
    const { result } = renderHook(() => useLiveOrganizerPositions(ORGANIZER_EVENT_ID, true));

    act(() => {
      fake.trigger(POSITIONS, createPositionsPayload([createParticipantPosition()]));
    });
    expect(result.current.positions).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(30_000);
      fake.trigger(
        POSITIONS,
        createPositionsPayload([
          createParticipantPosition({
            latitude: 48.9,
            longitude: 2.4,
            updatedAt: new Date().toISOString(),
          }),
        ]),
      );
    });
    expect(result.current.positions).toHaveLength(1);
    expect(result.current.positions[0]?.latitude).toBe(48.9);
  });

  it('ignores an older update than the one already known', () => {
    const fake = createFakeSocket();
    connect(fake);
    const { result } = renderHook(() => useLiveOrganizerPositions(ORGANIZER_EVENT_ID, true));
    act(() => {
      fake.trigger(
        POSITIONS,
        createPositionsPayload([createParticipantPosition({ latitude: 48.9 })]),
      );
      fake.trigger(
        POSITIONS,
        createPositionsPayload([
          createParticipantPosition({
            latitude: 10,
            updatedAt: new Date(Date.now() - 5000).toISOString(),
          }),
        ]),
      );
    });
    expect(result.current.positions[0]?.latitude).toBe(48.9);
  });

  it('keeps one entry per participant', () => {
    const fake = createFakeSocket();
    connect(fake);
    const { result } = renderHook(() => useLiveOrganizerPositions(ORGANIZER_EVENT_ID, true));
    act(() => {
      fake.trigger(
        POSITIONS,
        createPositionsPayload([
          createParticipantPosition({ userId: 'user-1' }),
          createParticipantPosition({ userId: 'user-2' }),
        ]),
      );
    });
    expect(userIds(result)).toEqual(['user-1', 'user-2']);
  });

  it('ignores messages of another event', () => {
    const fake = createFakeSocket();
    connect(fake);
    const { result } = renderHook(() => useLiveOrganizerPositions(ORGANIZER_EVENT_ID, true));
    act(() => {
      fake.trigger(POSITIONS, createPositionsPayload([createParticipantPosition()], 'other-event'));
    });
    expect(result.current.positions).toEqual([]);

    act(() => {
      fake.trigger(POSITIONS, createPositionsPayload());
      fake.trigger(STOPPED, createStoppedPayload({ eventId: 'other-event' }));
    });
    expect(userIds(result)).toEqual(['user-1']);
  });

  it('drops malformed positions', () => {
    const fake = createFakeSocket();
    connect(fake);
    const { result } = renderHook(() => useLiveOrganizerPositions(ORGANIZER_EVENT_ID, true));
    act(() => {
      fake.trigger(
        POSITIONS,
        createPositionsPayload([createParticipantPosition({ latitude: Number.NaN })]),
      );
    });
    expect(result.current.positions).toEqual([]);
  });

  it('removes the point when the sharing stops', () => {
    const fake = createFakeSocket();
    connect(fake);
    const { result } = renderHook(() => useLiveOrganizerPositions(ORGANIZER_EVENT_ID, true));
    act(() => {
      fake.trigger(
        POSITIONS,
        createPositionsPayload([
          createParticipantPosition({ userId: 'user-1' }),
          createParticipantPosition({ userId: 'user-2' }),
        ]),
      );
    });
    act(() => {
      fake.trigger(STOPPED, createStoppedPayload({ userId: 'user-1', reason: 'ARRIVED' }));
    });
    expect(userIds(result)).toEqual(['user-2']);
  });

  it('purges a point older than the stale delay', () => {
    const fake = createFakeSocket();
    connect(fake);
    const { result } = renderHook(() => useLiveOrganizerPositions(ORGANIZER_EVENT_ID, true));
    act(() => {
      fake.trigger(POSITIONS, createPositionsPayload());
    });

    act(() => {
      jest.advanceTimersByTime(LIVE_POSITION_STALE_MS - 10_000);
    });
    expect(result.current.positions).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(20_000);
    });
    expect(result.current.positions).toEqual([]);
  });

  it('stops the purge timer on unmount', () => {
    connect(createFakeSocket());
    const { unmount } = renderHook(() => useLiveOrganizerPositions(ORGANIZER_EVENT_ID, true));
    expect(jest.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('subscribes to the new socket and releases the old one when the socket changes', () => {
    const first = createFakeSocket();
    const second = createFakeSocket();
    connect(first);
    const { result, rerender } = renderHook(() =>
      useLiveOrganizerPositions(ORGANIZER_EVENT_ID, true),
    );
    expect(first.listenerCount(POSITIONS)).toBe(1);

    connect(second);
    rerender({});
    expect(first.listenerCount(POSITIONS)).toBe(0);
    expect(first.listenerCount(STOPPED)).toBe(0);
    expect(second.listenerCount(POSITIONS)).toBe(1);
    expect(second.listenerCount(STOPPED)).toBe(1);

    act(() => {
      second.trigger(POSITIONS, createPositionsPayload());
    });
    expect(result.current.positions).toHaveLength(1);
  });

  it('unsubscribes on unmount', () => {
    const fake = createFakeSocket();
    connect(fake);
    const { unmount } = renderHook(() => useLiveOrganizerPositions(ORGANIZER_EVENT_ID, true));
    unmount();
    expect(fake.listenerCount(POSITIONS)).toBe(0);
    expect(fake.listenerCount(STOPPED)).toBe(0);
  });

  it('does not subscribe while disabled, and empties the table when it becomes disabled', () => {
    const fake = createFakeSocket();
    connect(fake);
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useLiveOrganizerPositions(ORGANIZER_EVENT_ID, enabled),
      { initialProps: { enabled: false } },
    );
    expect(fake.listenerCount(POSITIONS)).toBe(0);

    rerender({ enabled: true });
    expect(fake.listenerCount(POSITIONS)).toBe(1);
    act(() => {
      fake.trigger(POSITIONS, createPositionsPayload());
    });
    expect(result.current.positions).toHaveLength(1);

    rerender({ enabled: false });
    expect(fake.listenerCount(POSITIONS)).toBe(0);
    expect(fake.listenerCount(STOPPED)).toBe(0);
    expect(result.current.positions).toEqual([]);

    rerender({ enabled: true });
    expect(result.current.positions).toEqual([]);
  });

  it('never shows the positions of a previous event after the event changes', () => {
    const fake = createFakeSocket();
    connect(fake);
    const { result, rerender } = renderHook(
      ({ eventId }: { eventId: string }) => useLiveOrganizerPositions(eventId, true),
      { initialProps: { eventId: ORGANIZER_EVENT_ID } },
    );
    act(() => {
      fake.trigger(POSITIONS, createPositionsPayload());
    });
    rerender({ eventId: 'evt-2' });
    expect(result.current.positions).toEqual([]);
  });

  it('does nothing without an event id or a socket', () => {
    useSocketMock.mockReturnValue({ socket: null, isConnected: false });
    const { result } = renderHook(() => useLiveOrganizerPositions(undefined, true));
    expect(result.current.positions).toEqual([]);
  });

  it('never writes a coordinate to the console', () => {
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) =>
      jest.spyOn(console, method).mockImplementation(jest.fn()),
    );
    const fake = createFakeSocket();
    connect(fake);
    const { unmount } = renderHook(() => useLiveOrganizerPositions(ORGANIZER_EVENT_ID, true));
    act(() => {
      fake.trigger(POSITIONS, createPositionsPayload());
      fake.trigger(STOPPED, createStoppedPayload());
      jest.advanceTimersByTime(LIVE_POSITION_STALE_MS + 10_000);
    });
    unmount();
    spies.forEach((spy) => {
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
