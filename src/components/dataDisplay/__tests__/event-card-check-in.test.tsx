import React from 'react';
import { render } from '@testing-library/react-native';
import { EventState, EventType } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import type * as ReactNavigationNative from '@react-navigation/native';
import { EventCard } from '../EventCard';

const mockUsePendingCheckIn = jest.fn<boolean, [AppEvent]>();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
  return { ...actual, useNavigation: () => ({ navigate: jest.fn() }) };
});

jest.mock('@/api/event/hooks/use-pending-check-in', () => ({
  usePendingCheckIn: (event: AppEvent) => mockUsePendingCheckIn(event),
}));

const event = {
  id: 'event-1',
  title: 'Nettoyage de la plage',
  state: EventState.EVENT_STATE_IN_PROGRESS,
  startAt: new Date(Date.now() - 3600000).toISOString(),
  endAt: new Date(Date.now() + 3600000).toISOString(),
  type: EventType.EVENT_TYPE_ECOLOGY,
  localisationName: 'Biarritz',
} as AppEvent;

describe('EventCard check-in notice', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    mockUsePendingCheckIn.mockReset();
  });

  it('shows the notice while the organizer has not checked the user in', () => {
    mockUsePendingCheckIn.mockReturnValue(true);
    const { getByTestId } = render(<EventCard event={event} />);
    expect(getByTestId('check-in-pending-notice')).toBeTruthy();
  });

  it('hides the notice once the user is checked in', () => {
    mockUsePendingCheckIn.mockReturnValue(false);
    const { queryByTestId } = render(<EventCard event={event} />);
    expect(queryByTestId('check-in-pending-notice')).toBeNull();
  });
});
