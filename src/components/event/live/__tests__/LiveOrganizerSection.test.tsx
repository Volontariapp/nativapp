import React from 'react';
import { act } from 'react';
import { cleanup, render, screen } from '@testing-library/react-native';
import { EventState } from '@volontariapp/contracts';
import { LiveWebsocketMessagingType } from '@volontariapp/messaging';
import { createLiveEvent } from '@/api/event/__tests__/live-event.factory';
import { createUserWeb } from '@/api/user/__tests__/user.factory';
import { useSocket } from '@/context/SocketContext';
import { createFakeSocket, type FakeSocket } from '@/hooks/__tests__/live-sharing.mock';
import {
  createParticipantPosition,
  createPositionsPayload,
} from '@/hooks/__tests__/live-organizer.factory';
import * as mockMaps from '@/screens/event/__tests__/react-native-maps.mock';
import { LiveOrganizerSection } from '../LiveOrganizerSection';

jest.mock('react-native-maps', () => mockMaps);
jest.mock('@/context/SocketContext', () => ({ useSocket: jest.fn() }));

const POSITIONS = LiveWebsocketMessagingType.LIVE_POSITIONS_UPDATED;
const EMPTY = 'Aucun participant ne partage sa position';

const setup = (): FakeSocket => {
  const fake = createFakeSocket();
  jest.mocked(useSocket).mockReturnValue({ socket: fake.socket, isConnected: true });
  return fake;
};

describe('LiveOrganizerSection', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('shows the map and listens for the organizer of a live event', () => {
    const fake = setup();
    const event = createLiveEvent({ id: 'evt-1', organizerId: 'organizer-1' });
    render(<LiveOrganizerSection event={event} currentUserId="organizer-1" participants={[]} />);
    expect(screen.getByText(EMPTY)).toBeTruthy();
    expect(fake.listenerCount(POSITIONS)).toBe(1);
  });

  it('displays a received position with the participant name', () => {
    const fake = setup();
    const event = createLiveEvent({ id: 'evt-1', organizerId: 'organizer-1' });
    render(
      <LiveOrganizerSection
        event={event}
        currentUserId="organizer-1"
        participants={[createUserWeb({ id: 'user-1', pseudo: 'Camille' })]}
      />,
    );
    act(() => {
      fake.trigger(
        POSITIONS,
        createPositionsPayload([createParticipantPosition({ userId: 'user-1' })], 'evt-1'),
      );
    });
    expect(screen.getByText('Camille')).toBeTruthy();
    expect(screen.queryByText(EMPTY)).toBeNull();
  });

  it('shows nothing and does not listen for a user who is not the organizer', () => {
    const fake = setup();
    const event = createLiveEvent({ id: 'evt-1', organizerId: 'organizer-1' });
    render(<LiveOrganizerSection event={event} currentUserId="someone-else" participants={[]} />);
    expect(screen.queryByTestId('live-organizer-map')).toBeNull();
    expect(fake.listenerCount(POSITIONS)).toBe(0);
  });

  it('shows nothing when the user is unknown', () => {
    const fake = setup();
    const event = createLiveEvent({ id: 'evt-1', organizerId: 'organizer-1' });
    render(<LiveOrganizerSection event={event} currentUserId={null} participants={[]} />);
    expect(screen.queryByTestId('live-organizer-map')).toBeNull();
    expect(fake.listenerCount(POSITIONS)).toBe(0);
  });

  it('shows nothing when the event is not live', () => {
    const fake = setup();
    const future = createLiveEvent({
      organizerId: 'organizer-1',
      state: EventState.EVENT_STATE_PUBLISHED,
      startAt: new Date(Date.now() + 3_600_000).toISOString(),
      endAt: new Date(Date.now() + 7_200_000).toISOString(),
    });
    const cancelled = createLiveEvent({
      organizerId: 'organizer-1',
      state: EventState.EVENT_STATE_CANCELLED,
    });
    for (const event of [future, cancelled]) {
      const view = render(
        <LiveOrganizerSection event={event} currentUserId="organizer-1" participants={[]} />,
      );
      expect(screen.queryByTestId('live-organizer-map')).toBeNull();
      expect(fake.listenerCount(POSITIONS)).toBe(0);
      view.unmount();
    }
  });

  it('shows nothing without an event', () => {
    setup();
    render(
      <LiveOrganizerSection event={undefined} currentUserId="organizer-1" participants={[]} />,
    );
    expect(screen.queryByTestId('live-organizer-map')).toBeNull();
  });
});
