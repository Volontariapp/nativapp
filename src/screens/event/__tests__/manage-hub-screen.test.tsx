import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ManageHubScreen } from '../ManageHubScreen';
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
});
