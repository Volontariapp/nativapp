import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import {
  ManageHubScreen,
  sortEventsByEarliestUpcoming,
  isEventCancelled,
} from '../ManageHubScreen';
import { EventState } from '@volontariapp/contracts';
import * as getParticipatedHook from '@/api/event/hooks/use-get-participated-events';
import * as getWishedHook from '@/api/event/hooks/use-get-wished-events';
import * as getMyEventsHook from '@/api/event/hooks/use-get-my-events';
import type { AppEvent } from '@/api/event/event.api';
import type * as ReactNavigationNative from '@react-navigation/native';
import type * as ReactNative from 'react-native';

const mockRootNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockRootNavigate,
    }),
  };
});

jest.mock('@/components/layout/AppHeader', () => {
  const { View } = jest.requireActual<typeof ReactNative>('react-native');
  return function MockAppHeader() {
    return <View testID="mock-app-header" />;
  };
});

jest.mock('@/components/ui/AppCalendar', () => {
  const { View } = jest.requireActual<typeof ReactNative>('react-native');
  return {
    AppCalendar: () => <View testID="mock-app-calendar" />,
  };
});

describe('ManageHubScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const setupMocks = (
    participatedEvents: AppEvent[] = [],
    wishedEvents: AppEvent[] = [],
    createdEvents: AppEvent[] = [],
  ) => {
    jest.spyOn(getParticipatedHook, 'useGetParticipatedEvents').mockReturnValue({
      data: { pages: [{ events: participatedEvents, totalCount: participatedEvents.length }] },
      isLoading: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
      refetch: jest.fn(),
      isRefetching: false,
    } as unknown as ReturnType<typeof getParticipatedHook.useGetParticipatedEvents>);

    jest.spyOn(getWishedHook, 'useGetWishedEvents').mockReturnValue({
      data: { pages: [{ events: wishedEvents, totalCount: wishedEvents.length }] },
      isLoading: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
      refetch: jest.fn(),
      isRefetching: false,
    } as unknown as ReturnType<typeof getWishedHook.useGetWishedEvents>);

    jest.spyOn(getMyEventsHook, 'useGetMyEvents').mockReturnValue({
      data: { pages: [{ events: createdEvents, totalCount: createdEvents.length }] },
      isLoading: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
      refetch: jest.fn(),
      isRefetching: false,
    } as unknown as ReturnType<typeof getMyEventsHook.useGetMyEvents>);
  };

  it('renders the header and 3 tabs with counters', () => {
    setupMocks([], [], []);

    const { getByText } = render(<ManageHubScreen />);

    expect(getByText('Gérer mes activités')).toBeTruthy();
    expect(getByText('En cours')).toBeTruthy();
    expect(getByText('Wishlist')).toBeTruthy();
    expect(getByText('Créés')).toBeTruthy();
  });

  it('displays the calendar empty state when En cours has no events', () => {
    setupMocks([], [], []);

    const { getByText, getByTestId } = render(<ManageHubScreen />);

    expect(getByText('Aucune mission en cours')).toBeTruthy();
    expect(getByText('Mon Calendrier')).toBeTruthy();
    expect(getByTestId('mock-app-calendar')).toBeTruthy();
    expect(getByText('Explorer les événements')).toBeTruthy();
  });

  it('navigates to explorer when pressing CTA in empty En cours state', () => {
    setupMocks([], [], []);

    const { getByText } = render(<ManageHubScreen />);

    fireEvent.press(getByText('Explorer les événements'));
    expect(mockRootNavigate).toHaveBeenCalledWith('MainTabs', { screen: 'explorer' });
  });

  it('renders category filters and removes the plus recent sort toggle', () => {
    setupMocks([], [], []);

    const { getByText, queryByText } = render(<ManageHubScreen />);

    expect(getByText('Tous')).toBeTruthy();
    expect(getByText('Écologie')).toBeTruthy();
    expect(getByText('Social')).toBeTruthy();
    expect(queryByText('Plus récents')).toBeNull();
    expect(queryByText('Prochains')).toBeNull();
  });

  it('renders the En cours presence sub-filters (Toutes, En direct, À venir)', () => {
    setupMocks([], [], []);

    const { getByText } = render(<ManageHubScreen />);

    expect(getByText(/Toutes/)).toBeTruthy();
    expect(getByText(/En direct/)).toBeTruthy();
    expect(getByText(/À venir/)).toBeTruthy();
  });

  it('switches to Wishlist tab and displays empty wishlist state', () => {
    setupMocks([], [], []);

    const { getByText } = render(<ManageHubScreen />);

    fireEvent.press(getByText('Wishlist'));

    expect(getByText('Votre wishlist est vide')).toBeTruthy();
    expect(getByText('Découvrir des missions')).toBeTruthy();
  });

  it('switches to Créés tab and displays empty created events state', () => {
    setupMocks([], [], []);

    const { getByText } = render(<ManageHubScreen />);

    fireEvent.press(getByText('Créés'));

    expect(getByText('Aucun événement créé')).toBeTruthy();
    expect(getByText('Créer un événement')).toBeTruthy();
  });

  it('sorts events with the earliest upcoming event first (live -> soonest -> distant -> past)', () => {
    const now = new Date('2026-10-22T12:00:00Z').getTime();

    const liveEvent = {
      id: 'live',
      title: 'Live Event',
      startAt: '2026-10-22T11:00:00Z',
      endAt: '2026-10-22T13:00:00Z',
    } as AppEvent;

    const soonEvent = {
      id: 'soon',
      title: 'Soon Event',
      startAt: '2026-10-22T15:00:00Z',
      endAt: '2026-10-22T17:00:00Z',
    } as AppEvent;

    const nextWeekEvent = {
      id: 'nextWeek',
      title: 'Next Week Event',
      startAt: '2026-10-29T10:00:00Z',
      endAt: '2026-10-29T12:00:00Z',
    } as AppEvent;

    const pastEvent = {
      id: 'past',
      title: 'Past Event',
      startAt: '2026-10-21T10:00:00Z',
      endAt: '2026-10-21T12:00:00Z',
    } as AppEvent;

    const unordered = [pastEvent, nextWeekEvent, liveEvent, soonEvent];
    const sorted = [...unordered].sort((a, b) => sortEventsByEarliestUpcoming(a, b, now));

    expect(sorted.map((e) => e.id)).toEqual(['live', 'soon', 'nextWeek', 'past']);
  });

  it('correctly identifies cancelled events via isEventCancelled', () => {
    const cancelledByState = {
      id: 'c1',
      title: 'Cancelled By State',
      state: EventState.EVENT_STATE_CANCELLED,
      startAt: '2026-10-25T10:00:00Z',
      endAt: '2026-10-25T12:00:00Z',
    } as AppEvent;

    const publishedFuture = {
      id: 'c2',
      title: 'Future Event',
      state: EventState.EVENT_STATE_PUBLISHED,
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now() + 90000000).toISOString(),
    } as AppEvent;

    const inProgress = {
      id: 'c3',
      title: 'Live Event',
      state: EventState.EVENT_STATE_IN_PROGRESS,
      startAt: new Date(Date.now() - 1000).toISOString(),
      endAt: new Date(Date.now() + 10000).toISOString(),
    } as AppEvent;

    expect(isEventCancelled(cancelledByState)).toBe(true);
    expect(isEventCancelled(publishedFuture)).toBe(false);
    expect(isEventCancelled(inProgress)).toBe(false);
  });

  it('never displays cancelled events in the En cours tab', () => {
    const activeEvent = {
      id: 'active-1',
      title: 'Activité en cours ou à venir',
      state: EventState.EVENT_STATE_PUBLISHED,
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now() + 90000000).toISOString(),
      type: 1,
      localisationName: 'Paris',
    } as AppEvent;

    const cancelledEvent = {
      id: 'cancelled-1',
      title: 'Événement Annulé Fantôme',
      state: EventState.EVENT_STATE_CANCELLED,
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now() + 90000000).toISOString(),
      type: 1,
      localisationName: 'Lyon',
    } as AppEvent;

    setupMocks([activeEvent, cancelledEvent], [], []);

    const { getByText, queryByText } = render(<ManageHubScreen />);

    expect(getByText('Activité en cours ou à venir')).toBeTruthy();
    expect(queryByText('Événement Annulé Fantôme')).toBeNull();
  });
});
