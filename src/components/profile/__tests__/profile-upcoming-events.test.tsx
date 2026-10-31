import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import * as mockExpoImage from './expo-image.mock';
import { mockNavigation } from './upcoming-events.mock';
import { NOW, createEventList, createUpcomingEvent } from './upcoming-events.factory';
import { ProfileUpcomingEvents } from '../profile-upcoming-events';

jest.mock('expo-image', () => mockExpoImage);
jest.mock('@react-navigation/native', () => mockNavigation);

const threeEvents = [
  createUpcomingEvent({ id: 'a', title: 'Maraude du samedi' }),
  createUpcomingEvent({ id: 'b', title: 'Collecte de livres' }),
  createUpcomingEvent({ id: 'c', title: 'Plantation de haies' }),
];

describe('ProfileUpcomingEvents', () => {
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
      <ProfileUpcomingEvents data={createEventList({ isLoading: true })} />,
    );

    expect(getByTestId('upcoming-events-loader')).toBeTruthy();
    expect(queryByText('Rien de prévu pour le moment')).toBeNull();
  });

  it('invites to explore when nothing is planned', () => {
    const { getByText } = render(<ProfileUpcomingEvents data={createEventList()} />);

    expect(getByText('Rien de prévu pour le moment')).toBeTruthy();
  });

  it('lists every upcoming event with their count in the header', () => {
    const { getByRole, getByText } = render(
      <ProfileUpcomingEvents data={createEventList({ events: threeEvents })} />,
    );

    expect(getByRole('header', { name: 'À venir' })).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
    expect(getByText('Maraude du samedi')).toBeTruthy();
    expect(getByText('Collecte de livres')).toBeTruthy();
    expect(getByText('Plantation de haies')).toBeTruthy();
  });

  it('features only the first event with its cover', () => {
    const { getAllByTestId } = render(
      <ProfileUpcomingEvents data={createEventList({ events: threeEvents })} />,
    );

    expect(getAllByTestId('upcoming-event-cover')).toHaveLength(1);
  });

  it('hides the see more button when there is no next page', () => {
    const { queryByText } = render(
      <ProfileUpcomingEvents data={createEventList({ events: threeEvents })} />,
    );

    expect(queryByText('Voir plus')).toBeNull();
  });

  it('loads the next page from the see more button', () => {
    const data = createEventList({ events: threeEvents, hasNextPage: true });
    const { getByText } = render(<ProfileUpcomingEvents data={data} />);

    fireEvent.press(getByText('Voir plus'));

    expect(data.fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('disables the button while the next page is loading', () => {
    const data = createEventList({
      events: threeEvents,
      hasNextPage: true,
      isFetchingNextPage: true,
    });
    const { getByText } = render(<ProfileUpcomingEvents data={data} />);

    fireEvent.press(getByText('Chargement...'));

    expect(data.fetchNextPage).not.toHaveBeenCalled();
  });

  it('shows a custom title instead of the default one', () => {
    const { getByRole } = render(
      <ProfileUpcomingEvents
        title="Prochain évènement"
        data={createEventList({ events: threeEvents })}
      />,
    );

    expect(getByRole('header', { name: 'Prochain évènement' })).toBeTruthy();
  });

  it('only renders the first events up to the limit while counting all of them', () => {
    const { getByText, queryByText } = render(
      <ProfileUpcomingEvents limit={1} data={createEventList({ events: threeEvents })} />,
    );

    expect(getByText('3')).toBeTruthy();
    expect(getByText('Maraude du samedi')).toBeTruthy();
    expect(queryByText('Collecte de livres')).toBeNull();
    expect(queryByText('Plantation de haies')).toBeNull();
  });

  it('hides the see more button when a limit is set', () => {
    const data = createEventList({ events: threeEvents, hasNextPage: true });
    const { queryByText } = render(<ProfileUpcomingEvents limit={2} data={data} />);

    expect(queryByText('Voir plus')).toBeNull();
  });
});
