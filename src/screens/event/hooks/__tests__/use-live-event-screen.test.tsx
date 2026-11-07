import { act } from 'react';
import { cleanup, renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { EventState } from '@volontariapp/contracts';
import { QueryClient } from '@tanstack/react-query';
import { createQueryWrapper } from '@/api/__tests__/query-wrapper.factory';
import { eventApi } from '@/api/event/event.api';
import { createLiveEvent, LIVE_ORIGIN } from '@/api/event/__tests__/live-event.factory';
import { socialApi } from '@/api/social/social.api';
import * as positionHook from '@/hooks/use-current-position';
import { routingService, type WalkingRoute } from '@/services/routing.service';
import * as mockScreen from '../../__tests__/live-event-screen.mock';
import { useLiveEventScreen } from '../use-live-event-screen';

jest.mock('@/api/client', () => ({ apiFetch: jest.fn() }));
jest.mock('@react-navigation/native', () => mockScreen.createNavigationModule());

const ROUTE: WalkingRoute = {
  distanceMeters: 600,
  durationSeconds: 480,
  geometry: [LIVE_ORIGIN, { latitude: 48.8616, longitude: 2.3522 }],
};

describe('useLiveEventScreen', () => {
  const spyOnApis = (
    overrides: { search?: ReturnType<typeof createLiveEvent>[] } = {},
  ): { getEvents: jest.SpyInstance } => {
    const getEvents = jest.spyOn(eventApi, 'getEvents').mockResolvedValue({
      events: overrides.search ?? [],
      totalCount: overrides.search?.length ?? 0,
    });
    jest.spyOn(eventApi, 'getParticipatedEvents').mockResolvedValue({ events: [], totalCount: 0 });
    jest.spyOn(eventApi, 'getMyEvents').mockResolvedValue({ events: [], totalCount: 0 });
    jest
      .spyOn(routingService, 'fetchWalkingDurations')
      .mockImplementation((_origin, destinations) =>
        Promise.resolve({ durationsSeconds: destinations.map(() => 300) }),
      );
    return { getEvents };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(positionHook, 'useCurrentPosition').mockReturnValue(
      mockScreen.createPositionState(),
    );
  });

  afterEach(() => {
    // Demonter avant de restaurer : un rendu tardif appellerait le vrai useCurrentPosition (ordre des hooks).
    cleanup();
    jest.restoreAllMocks();
  });

  // gcTime infini aussi pour les mutations : sinon leur minuterie garde Jest ouvert.
  const renderScreenHook = () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { gcTime: Infinity },
      },
    });
    return renderHook(() => useLiveEventScreen(), { wrapper: createQueryWrapper(client) });
  };

  it('requests a fresh position when the screen mounts', () => {
    spyOnApis();
    const position = mockScreen.createPositionState();
    jest.spyOn(positionHook, 'useCurrentPosition').mockReturnValue(position);

    renderScreenHook();

    expect(position.refresh).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['idle', 'locating'],
    ['locating', 'locating'],
    ['permission_denied', 'permission_denied'],
    ['error', 'error'],
  ] as const)('maps the position status %s to %s', (positionStatus, expected) => {
    const { getEvents } = spyOnApis();
    jest.spyOn(positionHook, 'useCurrentPosition').mockReturnValue(
      mockScreen.createPositionState({ status: positionStatus, coordinates: null }),
    );

    const { result } = renderScreenHook();

    expect(result.current.status).toBe(expected);
    expect(getEvents).not.toHaveBeenCalled();
  });

  it('goes from searching to ready, then to empty when nothing is found', async () => {
    spyOnApis({ search: [createLiveEvent({ id: 'a' })] });
    const ready = renderScreenHook();
    expect(ready.result.current.status).toBe('searching');
    await waitFor(() => {
      expect(ready.result.current.status).toBe('ready');
    });

    spyOnApis();
    const empty = renderScreenHook();
    await waitFor(() => {
      expect(empty.result.current.status).toBe('empty');
    });
  });

  it('reports an error when the search fails and refetches on retry', async () => {
    const { getEvents } = spyOnApis();
    getEvents.mockRejectedValueOnce(new Error('network'));
    const { result } = renderScreenHook();
    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    act(() => {
      result.current.handleRetry();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('empty');
    });
    expect(getEvents).toHaveBeenCalledTimes(2);
  });

  it('merges participations and organised events, live ones only (D1, D20)', async () => {
    spyOnApis();
    jest.spyOn(eventApi, 'getParticipatedEvents').mockResolvedValue({
      events: [
        createLiveEvent({ id: 'joined' }),
        createLiveEvent({ id: 'cancelled', state: EventState.EVENT_STATE_CANCELLED }),
        createLiveEvent({ id: 'finished', state: EventState.EVENT_STATE_FINISHED }),
      ],
      totalCount: 3,
    });
    jest.spyOn(eventApi, 'getMyEvents').mockResolvedValue({
      events: [
        createLiveEvent({ id: 'organised' }),
        createLiveEvent({ id: 'joined' }),
        createLiveEvent({ id: 'upcoming', startAt: '2999-01-01T10:00:00.000Z', state: 2 }),
      ],
      totalCount: 3,
    });

    const { result } = renderScreenHook();

    await waitFor(() => {
      expect(result.current.myEvents).toHaveLength(2);
    });
    expect(result.current.myEvents.map(({ event, isOrganizer }) => [event.id, isOrganizer])).toEqual([
      ['organised', true],
      ['joined', true],
    ]);
  });

  it('participates, then moves the event into the personal section', async () => {
    const candidate = createLiveEvent({ id: 'a', currentParticipants: 3 });
    spyOnApis({ search: [candidate] });
    const participate = jest
      .spyOn(socialApi, 'participate')
      .mockResolvedValue({ success: true, message: 'ok' });
    jest.spyOn(socialApi, 'unwishEvent').mockResolvedValue({ success: true, message: 'ok' });
    const { result } = renderScreenHook();
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    act(() => {
      result.current.handleParticipate(candidate);
    });

    await waitFor(() => {
      expect(result.current.myEvents).toHaveLength(1);
    });
    expect(participate).toHaveBeenCalledWith('a');
    expect(result.current.myEvents[0]?.event.currentParticipants).toBe(4);
    expect(result.current.myEvents[0]?.isOrganizer).toBe(false);
    expect(result.current.result.joinable).toHaveLength(0);
  });

  it('alerts when participation fails and keeps the candidate listed', async () => {
    const candidate = createLiveEvent({ id: 'a' });
    spyOnApis({ search: [candidate] });
    jest.spyOn(socialApi, 'participate').mockRejectedValue(new Error('409'));
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const { result } = renderScreenHook();
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    act(() => {
      result.current.handleParticipate(candidate);
    });

    await waitFor(() => {
      expect(alert).toHaveBeenCalledTimes(1);
    });
    expect(result.current.result.joinable).toHaveLength(1);
    expect(result.current.myEvents).toHaveLength(0);
  });

  it('fetches the walking route of the chosen event and clears it', async () => {
    const candidate = createLiveEvent({ id: 'a' });
    spyOnApis({ search: [candidate] });
    const fetchRoute = jest.spyOn(routingService, 'fetchWalkingRoute').mockResolvedValue(ROUTE);
    const { result } = renderScreenHook();
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    act(() => {
      result.current.handleSelectRoute(candidate);
    });

    await waitFor(() => {
      expect(result.current.selectedRoute?.route).toEqual(ROUTE);
    });
    expect(fetchRoute).toHaveBeenCalledWith(LIVE_ORIGIN, candidate.location, expect.anything());

    act(() => {
      result.current.handleClearRoute();
    });
    expect(result.current.selectedRoute).toBeNull();
  });

  it('opens the participations tab of ManageHub and goes back', () => {
    spyOnApis();
    const { result } = renderScreenHook();

    result.current.handleOpenMyEvents();
    result.current.handleBack();

    expect(mockScreen.mockNavigate).toHaveBeenCalledWith('MainTabs', {
      screen: 'create',
      params: { screen: 'ManageHub', params: { initialTab: 'participated' } },
    });
    expect(mockScreen.mockGoBack).toHaveBeenCalledTimes(1);
  });
});
