import React from 'react';
import { render } from '@testing-library/react-native';
import * as mockExpoImage from './expo-image.mock';
import { mockNavigation } from './upcoming-events.mock';
import { NOW, createEventList, createUpcomingEvent } from './upcoming-events.factory';
import { ProfileFinishedEvents } from '../profile-finished-events';

jest.mock('expo-image', () => mockExpoImage);
jest.mock('@react-navigation/native', () => mockNavigation);

const finishedEvent = (id: string, title: string, month: number) =>
  createUpcomingEvent({
    id,
    title,
    startAt: new Date(2026, month, 3, 9, 0).toISOString(),
    endAt: new Date(2026, month, 3, 12, 0).toISOString(),
  });

const fourEvents = [
  finishedEvent('a', 'Collecte de janvier', 0),
  finishedEvent('b', 'Collecte de mars', 2),
  finishedEvent('c', 'Collecte de mai', 4),
  finishedEvent('d', 'Collecte de septembre', 8),
];

describe('ProfileFinishedEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows a loader while the events are loading', () => {
    const { getByTestId, queryByText } = render(
      <ProfileFinishedEvents data={createEventList({ isLoading: true })} />,
    );

    expect(getByTestId('finished-events-loader')).toBeTruthy();
    expect(queryByText('Aucun évènement terminé pour le moment.')).toBeNull();
  });

  it('says so when no event is finished yet', () => {
    const { getByText } = render(<ProfileFinishedEvents data={createEventList()} />);

    expect(getByText('Aucun évènement terminé pour le moment.')).toBeTruthy();
  });

  it('titles the section and counts every finished event', () => {
    const { getByRole, getByText } = render(
      <ProfileFinishedEvents data={createEventList({ events: fourEvents })} />,
    );

    expect(getByRole('header', { name: 'Évènements terminés' })).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
  });

  it('lists the three most recent events first by default', () => {
    const { getAllByRole, queryByText } = render(
      <ProfileFinishedEvents data={createEventList({ events: fourEvents })} />,
    );

    const labels = getAllByRole('button').map((card) => String(card.props.accessibilityLabel));

    expect(labels).toHaveLength(3);
    expect(labels[0]).toContain('Collecte de septembre');
    expect(labels[1]).toContain('Collecte de mai');
    expect(labels[2]).toContain('Collecte de mars');
    expect(queryByText('Collecte de janvier')).toBeNull();
  });

  it('respects a custom limit', () => {
    const { getAllByRole } = render(
      <ProfileFinishedEvents limit={1} data={createEventList({ events: fourEvents })} />,
    );

    expect(getAllByRole('button')).toHaveLength(1);
  });

  it('never features a cover nor offers pagination', () => {
    const { queryByTestId, queryByText } = render(
      <ProfileFinishedEvents data={createEventList({ events: fourEvents, hasNextPage: true })} />,
    );

    expect(queryByTestId('upcoming-event-cover')).toBeNull();
    expect(queryByText('Voir plus')).toBeNull();
  });
});
