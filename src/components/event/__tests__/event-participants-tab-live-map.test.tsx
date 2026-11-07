import React from 'react';
import { act } from 'react';
import { cleanup, render, screen } from '@testing-library/react-native';
import { LiveWebsocketMessagingType } from '@volontariapp/messaging';
import { EventState } from '@volontariapp/contracts';
import { createLiveEvent } from '@/api/event/__tests__/live-event.factory';
import { createUserWeb } from '@/api/user/__tests__/user.factory';
import { useSocket } from '@/context/SocketContext';
import { createFakeSocket, type FakeSocket } from '@/hooks/__tests__/live-sharing.mock';
import {
  createParticipantPosition,
  createPositionsPayload,
} from '@/hooks/__tests__/live-organizer.factory';
import * as mockMaps from '@/screens/event/__tests__/react-native-maps.mock';
import type { AppEvent } from '@/api/event/event.api';
import { EventParticipantsTab } from '../EventParticipantsTab';

jest.mock('react-native-maps', () => mockMaps);
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@/context/SocketContext', () => ({ useSocket: jest.fn() }));
jest.mock('@/api/social/hooks/use-event-attendance', () => ({
  useEventAttendees: () => ({
    data: { attendees: [], pagination: undefined },
    refetch: jest.fn(),
    isSuccess: true,
    isError: false,
  }),
  useSetEventAttendance: () => ({ mutateAsync: jest.fn() }),
}));

const POSITIONS = LiveWebsocketMessagingType.LIVE_POSITIONS_UPDATED;

const renderTab = (event: AppEvent, currentUserId: string | null): FakeSocket => {
  const fake = createFakeSocket();
  jest.mocked(useSocket).mockReturnValue({ socket: fake.socket, isConnected: true });
  render(
    <EventParticipantsTab
      currentEvent={event}
      participants={[createUserWeb({ id: 'user-1', pseudo: 'Camille' })]}
      totalRegistered={1}
      isLoading={false}
      isRefetching={false}
      onRefresh={jest.fn()}
      onParticipantPress={jest.fn()}
      currentUserId={currentUserId}
    />,
  );
  return fake;
};

describe('EventParticipantsTab live organizer map', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('shows the map to the organizer of a live event and fills it from the socket', () => {
    const event = createLiveEvent({ id: 'evt-1', organizerId: 'organizer-1' });
    const fake = renderTab(event, 'organizer-1');
    expect(screen.getByTestId('live-organizer-map')).toBeTruthy();

    act(() => {
      fake.trigger(
        POSITIONS,
        createPositionsPayload([createParticipantPosition({ userId: 'user-1' })], 'evt-1'),
      );
    });
    expect(screen.getByText('il y a 0 s')).toBeTruthy();
  });

  it('hides the map from a user who is not the organizer', () => {
    const event = createLiveEvent({ id: 'evt-1', organizerId: 'organizer-1' });
    const fake = renderTab(event, 'someone-else');
    expect(screen.queryByTestId('live-organizer-map')).toBeNull();
    expect(fake.listenerCount(POSITIONS)).toBe(0);
  });

  it('hides the map when the event is not live', () => {
    const event = createLiveEvent({
      id: 'evt-1',
      organizerId: 'organizer-1',
      state: EventState.EVENT_STATE_PUBLISHED,
      startAt: new Date(Date.now() + 3_600_000).toISOString(),
      endAt: new Date(Date.now() + 7_200_000).toISOString(),
    });
    const fake = renderTab(event, 'organizer-1');
    expect(screen.queryByTestId('live-organizer-map')).toBeNull();
    expect(fake.listenerCount(POSITIONS)).toBe(0);
  });
});
