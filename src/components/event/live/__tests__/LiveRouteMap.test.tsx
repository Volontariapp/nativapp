import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { LIVE_ORIGIN } from '@/api/event/__tests__/live-event.factory';
import * as mockMaps from '@/screens/event/__tests__/react-native-maps.mock';
import { LiveRouteMap } from '../LiveRouteMap';

jest.mock('react-native-maps', () => mockMaps);

const DESTINATION = { latitude: 48.8616, longitude: 2.3522 };
const ROUTE = { distanceMeters: 600, durationSeconds: 480, geometry: [LIVE_ORIGIN, DESTINATION] };

interface RenderOptions {
  route?: typeof ROUTE | null;
  isLoading?: boolean;
  isError?: boolean;
}

const renderMap = ({ route = ROUTE, isLoading = false, isError = false }: RenderOptions = {}) => {
  const onClose = jest.fn();
  render(
    <LiveRouteMap
      title="Berges"
      origin={LIVE_ORIGIN}
      destination={DESTINATION}
      route={route}
      isLoading={isLoading}
      isError={isError}
      onClose={onClose}
    />,
  );
  return onClose;
};

describe('LiveRouteMap', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('opens straight in fullscreen with a single map and the route', () => {
    renderMap();

    expect(screen.getByTestId('live-route-fullscreen')).toBeTruthy();
    expect(screen.getAllByTestId('mock-map-view')).toHaveLength(1);
    expect(screen.getAllByTestId('mock-map-polyline')).toHaveLength(1);
  });

  it('has no inline card and no button to enlarge the map', () => {
    renderMap();

    expect(screen.queryByTestId('live-route-map')).toBeNull();
    expect(screen.queryByLabelText('Agrandir la carte en plein écran')).toBeNull();
    expect(screen.queryByTestId('live-route-fullscreen-open')).toBeNull();
  });

  it('shows the destination, the walking time and the distance over the map', () => {
    renderMap();

    expect(screen.getByText('Trajet vers Berges')).toBeTruthy();
    expect(screen.getByText(/à pied - 600 m/)).toBeTruthy();
  });

  it('shows an error message when the route is unavailable', () => {
    renderMap({ route: null, isError: true });

    expect(screen.getByText('Trajet indisponible pour le moment.')).toBeTruthy();
    expect(screen.queryByText(/à pied/)).toBeNull();
  });

  it('shows a loader while the route is computed, with the map already usable', () => {
    renderMap({ route: null, isLoading: true });

    expect(screen.getByTestId('live-route-loading')).toBeTruthy();
    expect(screen.getAllByTestId('mock-map-view')).toHaveLength(1);
    expect(screen.getAllByTestId('mock-map-marker')).toHaveLength(2);
  });

  it('closes the route from the close button', () => {
    const onClose = renderMap();

    fireEvent.press(screen.getByTestId('live-route-fullscreen-close'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes the route on the Android back button', () => {
    const onClose = renderMap();

    fireEvent(screen.getByTestId('live-route-modal'), 'requestClose');

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
