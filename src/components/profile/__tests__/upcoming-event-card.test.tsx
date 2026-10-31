import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import * as mockExpoImage from './expo-image.mock';
import { mockNavigate, mockNavigation } from './upcoming-events.mock';
import { NOW, createUpcomingEvent } from './upcoming-events.factory';
import { UpcomingEventCard } from '../upcoming-event-card';

jest.mock('expo-image', () => mockExpoImage);
jest.mock('@react-navigation/native', () => mockNavigation);

describe('UpcomingEventCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows the title, the place and the start time', () => {
    const { getByText } = render(<UpcomingEventCard event={createUpcomingEvent()} />);

    expect(getByText('Nettoyage des berges')).toBeTruthy();
    expect(getByText('Quai de Seine, Paris')).toBeTruthy();
    expect(getByText('09:30')).toBeTruthy();
  });

  it('puts the date on a tile with the weekday, the day and the month', () => {
    const { getByText } = render(<UpcomingEventCard event={createUpcomingEvent()} />);

    expect(getByText('MER')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
    expect(getByText('NOV')).toBeTruthy();
  });

  it('tells how far the event is', () => {
    const { getByText } = render(<UpcomingEventCard event={createUpcomingEvent()} />);

    expect(getByText('Dans 4 jours')).toBeTruthy();
  });

  it('shows the status of the event', () => {
    const { getByTestId } = render(<UpcomingEventCard event={createUpcomingEvent()} />);

    expect(getByTestId('event-status-badge')).toBeTruthy();
  });

  it('opens the event detail when pressed', () => {
    const event = createUpcomingEvent();
    const { getByRole } = render(<UpcomingEventCard event={event} />);

    fireEvent.press(getByRole('button'));

    expect(mockNavigate).toHaveBeenCalledWith('EventDetail', { event });
  });

  it('calls onPress instead of navigating when one is given', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <UpcomingEventCard event={createUpcomingEvent()} onPress={onPress} />,
    );

    fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('describes the event to screen readers', () => {
    const { getByLabelText } = render(<UpcomingEventCard event={createUpcomingEvent()} />);

    expect(
      getByLabelText('Nettoyage des berges, mercredi 4 novembre à 09:30, Quai de Seine, Paris'),
    ).toBeTruthy();
  });

  it('shows the cover image only in the featured variant', () => {
    const regular = render(<UpcomingEventCard event={createUpcomingEvent()} />);
    expect(regular.queryByTestId('upcoming-event-cover')).toBeNull();
    regular.unmount();

    const featured = render(<UpcomingEventCard event={createUpcomingEvent()} featured />);
    expect(featured.getByTestId('upcoming-event-cover')).toBeTruthy();
  });
});
