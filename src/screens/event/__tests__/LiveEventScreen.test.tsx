import React, { act } from 'react';
import { Alert } from 'react-native';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { EventState } from '@volontariapp/contracts';
import { createQueryWrapper } from '@/api/__tests__/query-wrapper.factory';
import { eventApi } from '@/api/event/event.api';
import type { AppEvent } from '@/api/event/event.api';
import { createLiveEvent, LIVE_ORIGIN } from '@/api/event/__tests__/live-event.factory';
import * as positionHook from '@/hooks/use-current-position';
import { socialApi } from '@/api/social/social.api';
import { routingService } from '@/services/routing.service';
import * as mockMaps from './react-native-maps.mock';
import * as mockScreen from './live-event-screen.mock';
import * as mockExpoImage from '@/components/event/live/__tests__/expo-image.mock';
import { LiveEventScreen } from '../LiveEventScreen';

jest.mock('react-native-maps', () => mockMaps);
jest.mock('expo-image', () => mockExpoImage);
jest.mock('@/api/client', () => ({ apiFetch: jest.fn() }));
jest.mock('@react-navigation/native', () => mockScreen.createNavigationModule());

interface ApiFixtures {
  search?: AppEvent[];
  participated?: AppEvent[];
  organized?: AppEvent[];
  durations?: (number | null)[];
}

const spyOnApis = ({ search = [], participated = [], organized = [], durations }: ApiFixtures) => {
  jest
    .spyOn(eventApi, 'getEvents')
    .mockResolvedValue({ events: search, totalCount: search.length });
  jest
    .spyOn(eventApi, 'getParticipatedEvents')
    .mockResolvedValue({ events: participated, totalCount: participated.length });
  jest
    .spyOn(eventApi, 'getMyEvents')
    .mockResolvedValue({ events: organized, totalCount: organized.length });
  jest
    .spyOn(routingService, 'fetchWalkingDurations')
    .mockImplementation((_o, destinations) =>
      Promise.resolve({ durationsSeconds: durations ?? destinations.map(() => 300) }),
    );
};

const renderScreen = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  return render(<LiveEventScreen />, { wrapper: createQueryWrapper(client) });
};

describe('LiveEventScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(positionHook, 'useCurrentPosition')
      .mockReturnValue(mockScreen.createPositionState());
  });

  afterEach(() => {
    // Demonter avant de restaurer : un rendu tardif appellerait le vrai useCurrentPosition (ordre des hooks).
    cleanup();
    jest.restoreAllMocks();
  });

  it('shows the locating state', () => {
    spyOnApis({});
    jest
      .spyOn(positionHook, 'useCurrentPosition')
      .mockReturnValue(mockScreen.createPositionState({ status: 'locating', coordinates: null }));
    renderScreen();

    expect(screen.getByTestId('live-status-locating')).toBeTruthy();
    expect(screen.getByText('Localisation en cours...')).toBeTruthy();
  });

  it('shows the searching state while the request is pending', () => {
    spyOnApis({});
    jest.spyOn(eventApi, 'getEvents').mockReturnValue(new Promise(() => undefined));
    renderScreen();

    expect(screen.getByTestId('live-status-searching')).toBeTruthy();
  });

  it('shows three joinable cards sorted by walking time', async () => {
    const events = ['a', 'b', 'c'].map((id) => createLiveEvent({ id, title: `Evt ${id}` }));
    spyOnApis({ search: events, durations: [900, 300, 600] });
    renderScreen();

    await waitFor(() => {
      expect(screen.getByTestId('live-candidate-b')).toBeTruthy();
    });
    expect(screen.getByText('AUTOUR DE MOI (2 km à pied)')).toBeTruthy();
    expect(screen.getByText('1.')).toBeTruthy();
    expect(screen.getByText('3.')).toBeTruthy();
    expect(screen.getByText('5 min')).toBeTruthy();
    expect(screen.getByText('15 min')).toBeTruthy();
    expect(screen.queryByText('estimé')).toBeNull();
  });

  it('shows the empty message', async () => {
    spyOnApis({});
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Aucun événement en direct autour de vous')).toBeTruthy();
    });
  });

  it('shows the permission message and sends no request', () => {
    spyOnApis({});
    const getEvents = jest.spyOn(eventApi, 'getEvents');
    jest
      .spyOn(positionHook, 'useCurrentPosition')
      .mockReturnValue(
        mockScreen.createPositionState({ status: 'permission_denied', coordinates: null }),
      );
    renderScreen();

    expect(screen.getByTestId('live-status-permission_denied')).toBeTruthy();
    expect(getEvents).not.toHaveBeenCalled();
  });

  it('shows the error state with a retry button that searches again', async () => {
    spyOnApis({});
    const getEvents = jest.spyOn(eventApi, 'getEvents').mockRejectedValueOnce(new Error('boom'));
    renderScreen();

    await waitFor(() => {
      expect(screen.getByTestId('live-retry')).toBeTruthy();
    });
    getEvents.mockResolvedValue({ events: [], totalCount: 0 });
    fireEvent.press(screen.getByTestId('live-retry'));

    await waitFor(() => {
      expect(screen.getByText('Aucun événement en direct autour de vous')).toBeTruthy();
    });
  });

  it('greys out a full event without any participation button', async () => {
    const open = createLiveEvent({ id: 'open' });
    const full = createLiveEvent({ id: 'full', maxParticipants: 25, currentParticipants: 25 });
    spyOnApis({ search: [open, full] });
    renderScreen();

    await waitFor(() => {
      expect(screen.getByTestId('live-full-section')).toBeTruthy();
    });
    expect(screen.getByText('Autres événements (complets)')).toBeTruthy();
    expect(screen.getByTestId('live-full-full')).toBeTruthy();
    expect(screen.getByTestId('live-participate-open')).toBeTruthy();
    expect(screen.queryByTestId('live-participate-full')).toBeNull();
  });

  it('mentions the estimate when OSRM is unavailable', async () => {
    spyOnApis({ search: [createLiveEvent({ id: 'a' })] });
    jest.spyOn(routingService, 'fetchWalkingDurations').mockRejectedValue(new Error('down'));
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText(/\(estimé\)/)).toBeTruthy();
    });
  });

  it('hides a cancelled event inside its time range everywhere', async () => {
    const cancelled = createLiveEvent({ id: 'cancelled', state: EventState.EVENT_STATE_CANCELLED });
    spyOnApis({ search: [cancelled], participated: [cancelled], organized: [cancelled] });
    renderScreen();

    await waitFor(() => {
      expect(screen.getByText('Aucun événement en direct autour de vous')).toBeTruthy();
    });
    expect(screen.queryByTestId('live-my-event-section')).toBeNull();
    expect(screen.queryByTestId('live-candidate-cancelled')).toBeNull();
  });

  it('shows my participation with a route button and opens the route map', async () => {
    const joined = createLiveEvent({ id: 'joined', title: 'Berges' });
    spyOnApis({ participated: [joined] });
    jest.spyOn(routingService, 'fetchWalkingRoute').mockResolvedValue({
      distanceMeters: 600,
      durationSeconds: 480,
      geometry: [LIVE_ORIGIN, { latitude: 48.8616, longitude: 2.3522 }],
    });
    renderScreen();

    await waitFor(() => {
      expect(screen.getByTestId('live-my-event-joined')).toBeTruthy();
    });
    expect(screen.getByText('MON ÉVÉNEMENT')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Comment y aller'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-map-polyline')).toBeTruthy();
    });
    expect(screen.getByText('Trajet vers Berges')).toBeTruthy();
  });

  it('shows no route icon, no leave button and no "Mes évts" for an organiser', async () => {
    spyOnApis({ organized: [createLiveEvent({ id: 'mine' })] });
    renderScreen();

    await waitFor(() => {
      expect(screen.getByTestId('live-my-event-mine')).toBeTruthy();
    });
    expect(screen.queryByTestId('live-route-mine')).toBeNull();
    expect(screen.queryByTestId('live-leave-mine')).toBeNull();
    expect(screen.queryByText('Mes évts')).toBeNull();
  });

  it('opens the event detail from the detail icon of a candidate', async () => {
    const event = createLiveEvent({ id: 'a' });
    spyOnApis({ search: [event] });
    renderScreen();

    await waitFor(() => {
      expect(screen.getByTestId('live-detail-a')).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId('live-detail-a'));

    expect(mockScreen.mockNavigate).toHaveBeenCalledWith('EventDetail', { event });
  });

  it('shows the cover and the participants of a candidate card', async () => {
    spyOnApis({
      search: [createLiveEvent({ id: 'a', maxParticipants: 20, currentParticipants: 8 })],
    });
    renderScreen();

    await waitFor(() => {
      expect(screen.getByTestId('live-candidate-a')).toBeTruthy();
    });
    expect(screen.getByTestId('live-event-cover')).toBeTruthy();
    expect(screen.getByText('8/20')).toBeTruthy();
  });

  it('leaves my event after confirmation and removes it from the section', async () => {
    spyOnApis({ participated: [createLiveEvent({ id: 'joined', title: 'Berges' })] });
    const unparticipate = jest
      .spyOn(socialApi, 'unparticipate')
      .mockResolvedValue({ success: true, message: 'ok' });
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    renderScreen();

    await waitFor(() => {
      expect(screen.getByTestId('live-leave-joined')).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId('live-leave-joined'));
    const buttons = alert.mock.calls[0]?.[2] ?? [];
    expect(unparticipate).not.toHaveBeenCalled();
    await act(async () => {
      buttons.find((button) => button.text === 'Quitter')?.onPress?.();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('live-my-event-section')).toBeNull();
    });
    expect(unparticipate).toHaveBeenCalledWith('joined');
  });

  it('goes back from the header', () => {
    spyOnApis({});
    renderScreen();

    fireEvent.press(screen.getByTestId('live-back'));

    expect(mockScreen.mockGoBack).toHaveBeenCalledTimes(1);
  });
});
