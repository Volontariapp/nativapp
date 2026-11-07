import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { LIVE_ORIGIN } from '@/api/event/__tests__/live-event.factory';
import * as mockMaps from '@/screens/event/__tests__/react-native-maps.mock';
import { LiveRouteMap } from '../LiveRouteMap';

jest.mock('react-native-maps', () => mockMaps);

const DESTINATION = { latitude: 48.8616, longitude: 2.3522 };

const renderMap = (onClose = jest.fn()) => {
  render(
    <LiveRouteMap
      title="Berges"
      origin={LIVE_ORIGIN}
      destination={DESTINATION}
      route={{ distanceMeters: 600, durationSeconds: 480, geometry: [LIVE_ORIGIN, DESTINATION] }}
      isLoading={false}
      isError={false}
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

  it('shows one map inline and no fullscreen map at first', () => {
    renderMap();

    expect(screen.getAllByTestId('mock-map-view')).toHaveLength(1);
    expect(screen.queryByTestId('live-route-fullscreen')).toBeNull();
  });

  it('opens the fullscreen map with the route, then closes it', () => {
    renderMap();

    fireEvent.press(screen.getByLabelText('Agrandir la carte en plein écran'));

    expect(screen.getByTestId('live-route-fullscreen')).toBeTruthy();
    expect(screen.getAllByTestId('mock-map-polyline')).toHaveLength(2);

    fireEvent.press(screen.getByTestId('live-route-fullscreen-close'));

    expect(screen.queryByTestId('live-route-fullscreen')).toBeNull();
  });

  it('closes the route from the inline header', () => {
    const onClose = renderMap();

    fireEvent.press(screen.getByLabelText('Fermer le trajet'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
