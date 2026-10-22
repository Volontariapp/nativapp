import { renderHook } from '@testing-library/react-native';
import { EventState, EventType } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import * as participatedHook from '@/api/event/hooks/use-get-participated-events';
import * as wishedHook from '@/api/event/hooks/use-get-wished-events';
import * as myEventsHook from '@/api/event/hooks/use-get-my-events';
import { useManageHubData } from '../use-manage-hub-data';

const makeEvent = (id: string, overrides: Partial<AppEvent> = {}): AppEvent => ({
  id,
  title: id,
  description: 'Description',
  startAt: '2999-01-01T10:00:00.000Z',
  endAt: '2999-01-01T12:00:00.000Z',
  localisationName: 'Paris',
  type: EventType.EVENT_TYPE_SOCIAL,
  state: EventState.EVENT_STATE_PUBLISHED,
  awardedImpactScore: 1,
  maxParticipants: 5,
  currentParticipants: 1,
  ...overrides,
});

const makeQuery = (events: AppEvent[], extra: Record<string, unknown> = {}) => ({
  data: { pages: [{ events, totalCount: events.length }] },
  isLoading: false,
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  isFetchingNextPage: false,
  refetch: jest.fn(),
  isRefetching: false,
  ...extra,
});

describe('useManageHubData', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const setup = (
    participated: ReturnType<typeof makeQuery>,
    wished: ReturnType<typeof makeQuery>,
    created: ReturnType<typeof makeQuery>,
  ) => {
    jest
      .spyOn(participatedHook, 'useGetParticipatedEvents')
      .mockReturnValue(
        participated as unknown as ReturnType<typeof participatedHook.useGetParticipatedEvents>,
      );
    jest
      .spyOn(wishedHook, 'useGetWishedEvents')
      .mockReturnValue(wished as unknown as ReturnType<typeof wishedHook.useGetWishedEvents>);
    jest
      .spyOn(myEventsHook, 'useGetMyEvents')
      .mockReturnValue(created as unknown as ReturnType<typeof myEventsHook.useGetMyEvents>);
  };

  it('excludes cancelled events from the participated tab and counts live and upcoming', () => {
    const live = makeEvent('live', {
      startAt: '2000-01-01T10:00:00.000Z',
      endAt: '2999-01-01T10:00:00.000Z',
    });
    const upcoming = makeEvent('upcoming');
    const cancelled = makeEvent('cancelled', { state: EventState.EVENT_STATE_CANCELLED });
    setup(makeQuery([upcoming, cancelled, live]), makeQuery([]), makeQuery([]));

    const { result } = renderHook(() => useManageHubData('participated', 'all', 'all'));

    expect(result.current.filteredEvents.map((e) => e.id)).toEqual(['live', 'upcoming']);
    expect(result.current.participatedCount).toBe(2);
    expect(result.current.liveCount).toBe(1);
    expect(result.current.upcomingCount).toBe(1);
  });

  it('applies the scope and type filters', () => {
    const live = makeEvent('live', {
      startAt: '2000-01-01T10:00:00.000Z',
      endAt: '2999-01-01T10:00:00.000Z',
      type: EventType.EVENT_TYPE_ECOLOGY,
    });
    const upcoming = makeEvent('upcoming');
    setup(makeQuery([upcoming, live]), makeQuery([]), makeQuery([]));

    const scoped = renderHook(() => useManageHubData('participated', 'all', 'live'));
    expect(scoped.result.current.filteredEvents.map((e) => e.id)).toEqual(['live']);

    const typed = renderHook(() => useManageHubData('participated', 'social', 'all'));
    expect(typed.result.current.filteredEvents.map((e) => e.id)).toEqual(['upcoming']);
  });

  it('exposes the wished and created lists with the server total count', () => {
    setup(
      makeQuery([]),
      makeQuery([makeEvent('w1')], {
        data: { pages: [{ events: [makeEvent('w1')], totalCount: 7 }] },
      }),
      makeQuery([makeEvent('c1'), makeEvent('c2')]),
    );

    const wished = renderHook(() => useManageHubData('wished', 'all', 'all'));
    expect(wished.result.current.filteredEvents.map((e) => e.id)).toEqual(['w1']);
    expect(wished.result.current.wishedCount).toBe(7);

    const created = renderHook(() => useManageHubData('created', 'all', 'all'));
    expect(created.result.current.filteredEvents).toHaveLength(2);
    expect(created.result.current.myEventsCount).toBe(2);
  });

  it('refreshes, paginates and reports loading for the active tab only', () => {
    const wished = makeQuery([makeEvent('w1')], {
      hasNextPage: true,
      isLoading: true,
      isRefetching: true,
      isFetchingNextPage: false,
    });
    const participated = makeQuery([]);
    setup(participated, wished, makeQuery([]));

    const { result } = renderHook(() => useManageHubData('wished', 'all', 'all'));

    result.current.onRefresh();
    result.current.handleEndReached();

    expect(wished.refetch).toHaveBeenCalledTimes(1);
    expect(wished.fetchNextPage).toHaveBeenCalledTimes(1);
    expect(participated.refetch).not.toHaveBeenCalled();
    expect(result.current.isRefreshing).toBe(true);
    expect(result.current.currentIsInitialLoading).toBe(true);
  });

  it('does not paginate while a next page is already loading', () => {
    const wished = makeQuery([], { hasNextPage: true, isFetchingNextPage: true });
    setup(makeQuery([]), wished, makeQuery([]));

    const { result } = renderHook(() => useManageHubData('wished', 'all', 'all'));
    result.current.handleEndReached();

    expect(wished.fetchNextPage).not.toHaveBeenCalled();
    expect(result.current.currentIsFetchingNext).toBe(true);
  });
});
