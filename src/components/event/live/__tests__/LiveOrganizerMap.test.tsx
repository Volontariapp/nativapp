import React from 'react';
import { cleanup, render, screen } from '@testing-library/react-native';
import { createUserWeb } from '@/api/user/__tests__/user.factory';
import * as mockMaps from '@/screens/event/__tests__/react-native-maps.mock';
import { LiveOrganizerMap, type LiveOrganizerMapProps } from '../LiveOrganizerMap';
import { createOrganizerPosition, ORGANIZER_NOW } from './live-organizer.factory';

jest.mock('react-native-maps', () => mockMaps);

const renderMap = (overrides?: Partial<LiveOrganizerMapProps>) =>
  render(
    <LiveOrganizerMap
      eventTitle="Nettoyage des berges"
      eventLocation={{ latitude: 48.8606, longitude: 2.3376 }}
      positions={[]}
      now={ORGANIZER_NOW}
      participants={[]}
      {...overrides}
    />,
  );

describe('LiveOrganizerMap', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('shows the empty message and the approximation note when nobody shares', () => {
    renderMap();
    expect(screen.getByText('Aucun participant ne partage sa position')).toBeTruthy();
    expect(screen.getByText('Position approximative (environ 100 m)')).toBeTruthy();
    expect(screen.getAllByTestId('mock-map-marker')).toHaveLength(1);
  });

  it('renders one marker per sharing participant, plus the event', () => {
    renderMap({
      positions: [
        createOrganizerPosition({ userId: 'user-raw-id-1' }),
        createOrganizerPosition({ userId: 'user-raw-id-2' }),
      ],
    });
    expect(screen.getAllByTestId('mock-map-marker')).toHaveLength(3);
    expect(screen.queryByText('Aucun participant ne partage sa position')).toBeNull();
  });

  it('shows the pseudo and the age of the last update', () => {
    renderMap({
      positions: [createOrganizerPosition({ userId: 'user-1' })],
      participants: [createUserWeb({ id: 'user-1', pseudo: 'Camille' })],
    });
    expect(screen.getByText('Camille')).toBeTruthy();
    expect(screen.getByText('C')).toBeTruthy();
    expect(screen.getByText('il y a 20 s')).toBeTruthy();
  });

  it('uses a neutral label and never the raw id when the participant is unknown', () => {
    renderMap({ positions: [createOrganizerPosition({ userId: 'user-raw-id-1' })] });
    expect(screen.getByText('Participant')).toBeTruthy();
    expect(screen.queryByText(/user-raw-id-1/)).toBeNull();
  });
});
