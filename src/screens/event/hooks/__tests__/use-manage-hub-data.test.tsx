import { act } from 'react';
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

    act(() => {
      result.current.onRefresh();
    });
    result.current.handleEndReached();

    expect(wished.refetch).toHaveBeenCalledTimes(1);
    expect(wished.fetchNextPage).toHaveBeenCalledTimes(1);
    expect(participated.refetch).not.toHaveBeenCalled();
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

  describe('background refreshes', () => {
    const day = (n: number): Partial<AppEvent> => ({
      startAt: `2999-01-0${String(n)}T10:00:00.000Z`,
      endAt: `2999-01-0${String(n)}T12:00:00.000Z`,
    });
    const ids = (events: AppEvent[]): string[] => events.map((e) => e.id);

    it('does not show the pull-to-refresh spinner for a background refetch', () => {
      setup(makeQuery([]), makeQuery([makeEvent('w1')], { isRefetching: true }), makeQuery([]));

      const { result } = renderHook(() => useManageHubData('wished', 'all', 'all'));

      expect(result.current.isRefreshing).toBe(false);
    });

    it('shows the spinner only while a manual refresh runs', async () => {
      let finishRefetch: () => void = () => undefined;
      const wished = makeQuery([makeEvent('w1')], {
        refetch: jest.fn(
          () =>
            new Promise<void>((resolve) => {
              finishRefetch = resolve;
            }),
        ),
      });
      setup(makeQuery([]), wished, makeQuery([]));
      const { result } = renderHook(() => useManageHubData('wished', 'all', 'all'));

      act(() => {
        result.current.onRefresh();
      });
      expect(result.current.isRefreshing).toBe(true);

      await act(async () => {
        finishRefetch();
        await Promise.resolve();
      });
      expect(result.current.isRefreshing).toBe(false);
    });

    it('keeps the list order and puts a new participation at the bottom, even if it is earlier', () => {
      const a = makeEvent('a', day(2));
      const b = makeEvent('b', day(3));
      setup(makeQuery([a, b]), makeQuery([]), makeQuery([]));
      const { result, rerender } = renderHook(() => useManageHubData('participated', 'all', 'all'));
      expect(ids(result.current.filteredEvents)).toEqual(['a', 'b']);

      setup(makeQuery([a, b, makeEvent('c', day(1))]), makeQuery([]), makeQuery([]));
      rerender({});

      expect(ids(result.current.filteredEvents)).toEqual(['a', 'b', 'c']);
    });

    it('removes an event that left the list without moving the others', () => {
      const a = makeEvent('a', day(2));
      const b = makeEvent('b', day(3));
      const c = makeEvent('c', day(4));
      setup(makeQuery([a, b, c]), makeQuery([]), makeQuery([]));
      const { result, rerender } = renderHook(() => useManageHubData('participated', 'all', 'all'));

      setup(makeQuery([a, c]), makeQuery([]), makeQuery([]));
      rerender({});

      expect(ids(result.current.filteredEvents)).toEqual(['a', 'c']);
    });

    it('sorts the list again after a manual refresh', async () => {
      const a = makeEvent('a', day(2));
      const b = makeEvent('b', day(3));
      setup(makeQuery([a, b]), makeQuery([]), makeQuery([]));
      const { result, rerender } = renderHook(() => useManageHubData('participated', 'all', 'all'));
      setup(makeQuery([a, b, makeEvent('c', day(1))]), makeQuery([]), makeQuery([]));
      rerender({});

      await act(async () => {
        result.current.onRefresh();
        await Promise.resolve();
      });

      expect(ids(result.current.filteredEvents)).toEqual(['c', 'a', 'b']);
    });
  });
});
