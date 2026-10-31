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

const NEXT = 'Évènement suivant';
const PREVIOUS = 'Évènement précédent';

describe('ProfileUpcomingEvents carousel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows only the first event and a single arrow to the right at the start', () => {
    const { getByText, queryByText, getByLabelText, queryByLabelText } = render(
      <ProfileUpcomingEvents data={createEventList({ events: threeEvents })} carousel />,
    );

    expect(getByText('Maraude du samedi')).toBeTruthy();
    expect(queryByText('Collecte de livres')).toBeNull();
    expect(getByLabelText(NEXT)).toBeTruthy();
    expect(queryByLabelText(PREVIOUS)).toBeNull();
    expect(getByText('1 / 3')).toBeTruthy();
  });

  it('moves to the next event and then offers the way back', () => {
    const { getByText, queryByText, getByLabelText } = render(
      <ProfileUpcomingEvents data={createEventList({ events: threeEvents })} carousel />,
    );

    fireEvent.press(getByLabelText(NEXT));

    expect(getByText('Collecte de livres')).toBeTruthy();
    expect(queryByText('Maraude du samedi')).toBeNull();
    expect(getByLabelText(PREVIOUS)).toBeTruthy();
    expect(getByText('2 / 3')).toBeTruthy();

    fireEvent.press(getByLabelText(PREVIOUS));

    expect(getByText('Maraude du samedi')).toBeTruthy();
  });

  it('removes the right arrow on the last event', () => {
    const { getByText, getByLabelText, queryByLabelText } = render(
      <ProfileUpcomingEvents data={createEventList({ events: threeEvents })} carousel />,
    );

    fireEvent.press(getByLabelText(NEXT));
    fireEvent.press(getByLabelText(NEXT));

    expect(getByText('Plantation de haies')).toBeTruthy();
    expect(queryByLabelText(NEXT)).toBeNull();
    expect(getByLabelText(PREVIOUS)).toBeTruthy();
  });

  it('shows no arrow nor counter for a single event', () => {
    const { getByText, queryByLabelText, queryByText } = render(
      <ProfileUpcomingEvents
        data={createEventList({ events: threeEvents.slice(0, 1) })}
        carousel
      />,
    );

    expect(getByText('Maraude du samedi')).toBeTruthy();
    expect(queryByLabelText(NEXT)).toBeNull();
    expect(queryByLabelText(PREVIOUS)).toBeNull();
    expect(queryByText('1 / 1')).toBeNull();
  });

  it('asks for the next page once the last loaded event is reached', () => {
    const fetchNextPage = jest.fn();
    const { getByLabelText, queryByText } = render(
      <ProfileUpcomingEvents
        data={createEventList({ events: threeEvents, hasNextPage: true, fetchNextPage })}
        carousel
      />,
    );

    fireEvent.press(getByLabelText(NEXT));
    expect(fetchNextPage).not.toHaveBeenCalled();

    fireEvent.press(getByLabelText(NEXT));

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    expect(queryByText('Voir plus')).toBeNull();
  });

  it('stays on a valid event when the list gets shorter', () => {
    const data = createEventList({ events: threeEvents });
    const { getByLabelText, getByText, rerender } = render(
      <ProfileUpcomingEvents data={data} carousel />,
    );
    fireEvent.press(getByLabelText(NEXT));
    fireEvent.press(getByLabelText(NEXT));

    rerender(
      <ProfileUpcomingEvents data={{ ...data, events: threeEvents.slice(0, 1) }} carousel />,
    );

    expect(getByText('Maraude du samedi')).toBeTruthy();
  });
});
