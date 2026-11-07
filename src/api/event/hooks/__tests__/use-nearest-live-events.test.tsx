import { renderHook, waitFor } from '@testing-library/react-native';
import { EventState } from '@volontariapp/contracts';
import { createQueryWrapper, createTestQueryClient } from '@/api/__tests__/query-wrapper.factory';
import { routingService } from '@/services/routing.service';
import { eventApi } from '../../event.api';
import { createLiveEvent, LIVE_ORIGIN } from '../../__tests__/live-event.factory';
import { useNearestLiveEvents } from '../use-nearest-live-events';

jest.mock('@/api/client', () => ({ apiFetch: jest.fn() }));

const NOW = new Date('2026-11-07T12:00:00.000Z').getTime();

describe('useNearestLiveEvents', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends exactly the search parameters of the spec, without endAtFrom', async () => {
    const getEvents = jest.spyOn(eventApi, 'getEvents').mockResolvedValue({
      events: [],
      totalCount: 0,
    });
    const { result } = renderHook(() => useNearestLiveEvents(LIVE_ORIGIN), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getEvents).toHaveBeenCalledTimes(1);
    expect(getEvents).toHaveBeenCalledWith({
      area: { center: LIVE_ORIGIN, radiusMeters: 2000 },
      statuses: [EventState.EVENT_STATE_PUBLISHED, EventState.EVENT_STATE_IN_PROGRESS],
      startDateFrom: new Date(NOW - 24 * 60 * 60 * 1000).toISOString(),
      startDateTo: new Date(NOW).toISOString(),
      onlyAvailable: false,
      excludeBlockedUsers: true,
      excludeParticipatedByMe: true,
      excludeCreatedByMe: true,
      page: 1,
      limit: 30,
    });
    expect(getEvents.mock.calls[0]?.[0]).not.toHaveProperty('endAtFrom');
  });

  it('skips OSRM when no event is a live candidate', async () => {
    jest.spyOn(eventApi, 'getEvents').mockResolvedValue({
      events: [createLiveEvent({ state: EventState.EVENT_STATE_CANCELLED }, NOW)],
      totalCount: 1,
    });
    const durations = jest.spyOn(routingService, 'fetchWalkingDurations');
    const { result } = renderHook(() => useNearestLiveEvents(LIVE_ORIGIN), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({ joinable: [], full: [] });
    expect(durations).not.toHaveBeenCalled();
  });

  it('uses the OSRM walking durations and sorts joinable events', async () => {
    const near = createLiveEvent({ id: 'near' }, NOW);
    const far = createLiveEvent({ id: 'far' }, NOW);
    jest.spyOn(eventApi, 'getEvents').mockResolvedValue({ events: [far, near], totalCount: 2 });
    jest
      .spyOn(routingService, 'fetchWalkingDurations')
      .mockResolvedValue({ durationsSeconds: [900, 300] });
    const { result } = renderHook(() => useNearestLiveEvents(LIVE_ORIGIN), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const joinable = result.current.data?.joinable ?? [];
    expect(joinable.map((candidate) => candidate.walkSeconds)).toEqual([300, 900]);
    expect(joinable.every((candidate) => !candidate.isEstimated)).toBe(true);
  });

  it('falls back to estimated durations when OSRM fails', async () => {
    jest.spyOn(eventApi, 'getEvents').mockResolvedValue({
      events: [createLiveEvent({ id: 'a' }, NOW)],
      totalCount: 1,
    });
    jest.spyOn(routingService, 'fetchWalkingDurations').mockRejectedValue(new Error('OSRM down'));
    const { result } = renderHook(() => useNearestLiveEvents(LIVE_ORIGIN), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const candidate = result.current.data?.joinable[0];
    expect(candidate?.isEstimated).toBe(true);
    expect(candidate?.walkSeconds).toBeGreaterThan(0);
  });

  it('stays disabled and sends no request without a position', () => {
    const getEvents = jest.spyOn(eventApi, 'getEvents');
    const { result } = renderHook(() => useNearestLiveEvents(null), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getEvents).not.toHaveBeenCalled();
  });

  it('aborts the routing request when the query is cancelled', async () => {
    jest.spyOn(eventApi, 'getEvents').mockResolvedValue({
      events: [createLiveEvent({ id: 'a' }, NOW)],
      totalCount: 1,
    });
    let routingSignal: AbortSignal | undefined;
    const durations = jest
      .spyOn(routingService, 'fetchWalkingDurations')
      .mockImplementation((_origin, _destinations, signal) => {
        routingSignal = signal;
        return new Promise(() => undefined);
      });
    const client = createTestQueryClient();
    renderHook(() => useNearestLiveEvents(LIVE_ORIGIN), { wrapper: createQueryWrapper(client) });

    await waitFor(() => {
      expect(durations).toHaveBeenCalledTimes(1);
    });
    expect(routingSignal?.aborted).toBe(false);

    await client.cancelQueries();

    expect(routingSignal?.aborted).toBe(true);
  });
});
