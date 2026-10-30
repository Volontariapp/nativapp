import React, { act } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import type {
  GetRankingEventsWebRequest,
  RankingListKindWeb,
  RecordEventFeedbackWebResponse,
  RequestRankingRefreshWebResponse,
  UpdateUserLocationWebResponse,
} from '@volontariapp/contracts';
import { EventState, EventType } from '@volontariapp/contracts';
import type { LocationObject } from 'expo-location';
import { useSwipeScreen } from '../use-swipe-screen';
import type { RankedAppEvent, RankingEventsResult } from '@/api/ranking/ranking.api';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

const mockGetEvents = jest.fn<Promise<RankingEventsResult>, [GetRankingEventsWebRequest?]>();
const mockRecordFeedback = jest.fn<Promise<RecordEventFeedbackWebResponse>, [string[]]>();
const mockUpdateLocation = jest.fn<Promise<UpdateUserLocationWebResponse>, [number, number]>();
const mockRequestRefresh = jest.fn<
  Promise<RequestRankingRefreshWebResponse>,
  [RankingListKindWeb]
>();

jest.mock('@/api/ranking/ranking.api', () => ({
  rankingApi: {
    getEvents: (params?: GetRankingEventsWebRequest) => mockGetEvents(params),
    recordFeedback: (eventIds: string[]) => mockRecordFeedback(eventIds),
    updateLocation: (lat: number, lng: number) => mockUpdateLocation(lat, lng),
    requestRefresh: (listKind: RankingListKindWeb) => mockRequestRefresh(listKind),
  },
}));

interface MockGetEventsReturn {
  data: { pages: Array<{ events: RankedAppEvent[]; totalCount: number }> };
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

const mockUseGetEvents = jest.fn<MockGetEventsReturn, [unknown?]>();
jest.mock('@/api/event/hooks/use-get-events', () => ({
  useGetEvents: (params?: unknown) => mockUseGetEvents(params),
}));

interface MockLocationReturn {
  locationObject: LocationObject | null;
  coordinates: { latitude: number; longitude: number } | null;
  isPermissionDenied: boolean;
}

const mockUseLocation = jest.fn<MockLocationReturn, []>();
jest.mock('@/hooks/use-location', () => ({
  useLocation: () => mockUseLocation(),
}));

const mockWish = jest.fn<Promise<void>, [string]>();
jest.mock('@/api/social/hooks/use-user-social-actions', () => ({
  useUserSocialActions: () => ({
    wish: (id: string) => mockWish(id),
  }),
}));

const createFakeEvent = (id: string, title = 'Event'): RankedAppEvent => ({
  id,
  title,
  description: 'Desc',
  localisationName: 'Paris',
  awardedImpactScore: 10,
  maxParticipants: 20,
  currentParticipants: 2,
  tags: [],
  requirements: [],
  startAt: '2026-10-25T10:00:00.000Z',
  endAt: '2026-10-25T12:00:00.000Z',
  type: EventType.EVENT_TYPE_ECOLOGY,
  state: EventState.EVENT_STATE_PUBLISHED,
  rankingScore: 80,
  reasons: [],
});

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

const rankingEventsPage = (events: RankedAppEvent[]): RankingEventsResult => ({
  isFallback: false,
  events,
  totalCount: events.length,
  ranking: {
    source: 'FULL',
    computedAt: '2026-10-20T08:00:00.000Z',
    stale: false,
    hasMore: false,
    versionChanged: false,
    listVersion: 'v1',
    nextCursor: '',
  },
});

const renderSwipeHook = (queryClient: QueryClient = createTestQueryClient()) => {
  const wrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useSwipeScreen(), { wrapper });
};

describe('useSwipeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestRefresh.mockResolvedValue({
      accepted: true,
      refreshThrottled: false,
    });
    mockRecordFeedback.mockResolvedValue({ recorded: 0 });
    mockUpdateLocation.mockResolvedValue({ accepted: true });
    mockWish.mockResolvedValue(undefined);
    mockUseLocation.mockReturnValue({
      locationObject: null,
      coordinates: null,
      isPermissionDenied: false,
    });
    mockUseGetEvents.mockReturnValue({
      data: { pages: [{ events: [], totalCount: 0 }] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
    });
  });

  it('renders ranked events when ranking API succeeds', async () => {
    mockGetEvents.mockResolvedValueOnce({
      isFallback: false,
      events: [createFakeEvent('evt-1', 'Ranked 1'), createFakeEvent('evt-2', 'Ranked 2')],
      totalCount: 2,
      ranking: {
        source: 'FULL',
        computedAt: '2026-10-20T08:00:00.000Z',
        stale: false,
        hasMore: false,
        versionChanged: false,
        listVersion: 'v1',
        nextCursor: '',
      },
    });

    const { result } = renderSwipeHook();

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });

    expect(result.current.events[0]?.id).toBe('evt-1');
  });

  it('falls back to useGetEvents without DRAFT when ranking returns fallback (206)', async () => {
    mockGetEvents.mockResolvedValueOnce({
      isFallback: true,
      events: [],
      totalCount: 0,
      ranking: null,
    });

    mockUseGetEvents.mockReturnValue({
      data: {
        pages: [
          {
            events: [createFakeEvent('fb-1', 'Fallback 1')],
            totalCount: 1,
          },
        ],
      },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
    });

    const { result } = renderSwipeHook();

    await waitFor(() => {
      expect(result.current.events).toHaveLength(1);
    });

    expect(result.current.events[0]?.id).toBe('fb-1');

    expect(mockUseGetEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        statuses: [EventState.EVENT_STATE_PUBLISHED],
      }),
    );
  });

  it('batches left swipes and sends PASS feedback every 5 cards', async () => {
    const fakeEvents = Array.from({ length: 10 }, (_, i) => createFakeEvent(`evt-${String(i)}`));
    mockGetEvents.mockResolvedValueOnce({
      isFallback: false,
      events: fakeEvents,
      totalCount: 10,
      ranking: {
        source: 'FULL',
        computedAt: '2026-10-20T08:00:00.000Z',
        stale: false,
        hasMore: false,
        versionChanged: false,
        listVersion: 'v1',
        nextCursor: '',
      },
    });
    mockRecordFeedback.mockResolvedValue({ recorded: 5 });

    const { result } = renderSwipeHook();

    await waitFor(() => {
      expect(result.current.events).toHaveLength(10);
    });

    act(() => {
      result.current.handleSwipeLeft(0);
      result.current.handleSwipeLeft(1);
      result.current.handleSwipeLeft(2);
      result.current.handleSwipeLeft(3);
    });

    expect(mockRecordFeedback).not.toHaveBeenCalled();

    act(() => {
      result.current.handleSwipeLeft(4);
    });

    expect(mockRecordFeedback).toHaveBeenCalledWith(['evt-0', 'evt-1', 'evt-2', 'evt-3', 'evt-4']);
  });

  it('flushes pending PASS feedback on app background transition', async () => {
    const fakeEvents = [createFakeEvent('evt-1'), createFakeEvent('evt-2')];
    mockGetEvents.mockResolvedValueOnce({
      isFallback: false,
      events: fakeEvents,
      totalCount: 2,
      ranking: {
        source: 'FULL',
        computedAt: '2026-10-20T08:00:00.000Z',
        stale: false,
        hasMore: false,
        versionChanged: false,
        listVersion: 'v1',
        nextCursor: '',
      },
    });
    mockRecordFeedback.mockResolvedValue({ recorded: 2 });

    let appStateListener: ((state: AppStateStatus) => void) | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((event, listener) => {
      if (event === 'change') {
        appStateListener = listener;
      }
      return { remove: jest.fn() };
    });

    const { result } = renderSwipeHook();

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });

    act(() => {
      result.current.handleSwipeLeft(0);
      result.current.handleSwipeLeft(1);
    });

    expect(mockRecordFeedback).not.toHaveBeenCalled();

    act(() => {
      appStateListener?.('background');
    });

    expect(mockRecordFeedback).toHaveBeenCalledWith(['evt-1', 'evt-2']);
  });

  it('calls wish on swipe right', async () => {
    mockGetEvents.mockResolvedValueOnce({
      isFallback: false,
      events: [createFakeEvent('evt-right')],
      totalCount: 1,
      ranking: {
        source: 'FULL',
        computedAt: '2026-10-20T08:00:00.000Z',
        stale: false,
        hasMore: false,
        versionChanged: false,
        listVersion: 'v1',
        nextCursor: '',
      },
    });

    const { result } = renderSwipeHook();

    await waitFor(() => {
      expect(result.current.events).toHaveLength(1);
    });

    act(() => {
      result.current.handleSwipeRight(0);
    });

    expect(mockWish).toHaveBeenCalledWith('evt-right');
  });

  it('keeps the deck stable while swiping, then never shows a wished or passed event again when the screen opens again', async () => {
    const fakeEvents = [
      createFakeEvent('evt-1'),
      createFakeEvent('evt-2'),
      createFakeEvent('evt-3'),
    ];
    mockGetEvents.mockResolvedValue(rankingEventsPage(fakeEvents));
    const queryClient = createTestQueryClient();

    const first = renderSwipeHook(queryClient);
    await waitFor(() => {
      expect(first.result.current.events).toHaveLength(3);
    });

    act(() => {
      first.result.current.handleSwipeRight(0);
      first.result.current.handleSwipeLeft(1);
    });
    expect(first.result.current.events).toHaveLength(3);
    first.unmount();

    const second = renderSwipeHook(queryClient);
    await waitFor(() => {
      expect(second.result.current.events.map((event) => event.id)).toEqual(['evt-3']);
    });
  });

  it('drops the handled events and restarts at the first card when the stack is reloaded at the end', async () => {
    const stale = [createFakeEvent('evt-1'), createFakeEvent('evt-2')];
    mockGetEvents
      .mockResolvedValueOnce(rankingEventsPage(stale))
      .mockResolvedValue(rankingEventsPage([...stale, createFakeEvent('evt-3')]));

    const { result } = renderSwipeHook();
    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });

    act(() => {
      result.current.handleSwipeRight(0);
      result.current.handleSwipeLeft(1);
    });

    await waitFor(() => {
      expect(result.current.events.map((event) => event.id)).toEqual(['evt-3']);
    });
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isEndReached).toBe(false);
    expect(mockRequestRefresh).toHaveBeenCalledWith('EVENT');
  });

  it('sends user location if permitted and throttles updates', async () => {
    mockUseLocation.mockReturnValue({
      locationObject: null,
      coordinates: { latitude: 45.75, longitude: 4.85 },
      isPermissionDenied: false,
    });
    mockGetEvents.mockResolvedValueOnce({
      isFallback: false,
      events: [],
      totalCount: 0,
      ranking: {
        source: 'COLD_START',
        computedAt: '2026-10-20T08:00:00.000Z',
        stale: false,
        hasMore: false,
        versionChanged: false,
        listVersion: 'v1',
        nextCursor: '',
      },
    });
    mockUpdateLocation.mockResolvedValue({ accepted: true });

    renderSwipeHook();

    await waitFor(() => {
      expect(mockUpdateLocation).toHaveBeenCalledWith(45.75, 4.85);
    });
  });
});
