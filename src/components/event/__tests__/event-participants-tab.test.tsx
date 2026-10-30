import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { createUserWeb } from '@/api/user/__tests__/user.factory';
import { createMockAppEvent } from '@/components/post/__tests__/event.factory';
import { EventState } from '@volontariapp/contracts';
import { EventParticipantsTab } from '../EventParticipantsTab';

const mockMutateAsync = jest.fn().mockResolvedValue({ success: true, message: 'Updated' });
const mockRefetchAttendees = jest.fn();

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@/api/social/hooks/use-event-attendance', () => ({
  useEventAttendees: () => ({
    data: {
      attendees: [
        {
          userId: 'user-1',
          registeredAt: '2026-06-01T10:00:00Z',
          checkedInAt: '2026-06-01T10:15:00Z',
        },
      ],
      pagination: undefined,
    },
    refetch: mockRefetchAttendees,
  }),
  useSetEventAttendance: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

describe('EventParticipantsTab', () => {
  const participants = [
    createUserWeb({ id: 'user-1', pseudo: 'User One' }),
    createUserWeb({ id: 'user-2', pseudo: 'User Two' }),
    createUserWeb({ id: 'user-3', pseudo: 'User Three' }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders attendance banner when event is in progress and displays present count', () => {
    const event = createMockAppEvent({
      id: 'event-10',
      state: EventState.EVENT_STATE_IN_PROGRESS,
    });

    const { getByText } = render(
      <EventParticipantsTab
        currentEvent={event}
        participants={participants}
        totalRegistered={3}
        isLoading={false}
        isRefetching={false}
        onRefresh={jest.fn()}
        onParticipantPress={jest.fn()}
      />,
    );

    expect(getByText('1 / 3 participants émargé')).toBeTruthy();
    expect(getByText('Encore 2 présent(s) requis pour débloquer la prime créateur.')).toBeTruthy();
  });

  it('allows organizer to check in participant when in progress', async () => {
    const event = createMockAppEvent({
      id: 'event-10',
      state: EventState.EVENT_STATE_IN_PROGRESS,
    });

    const { getAllByText } = render(
      <EventParticipantsTab
        currentEvent={event}
        participants={participants}
        totalRegistered={3}
        isLoading={false}
        isRefetching={false}
        onRefresh={jest.fn()}
        onParticipantPress={jest.fn()}
      />,
    );

    const checkInButtons = getAllByText('Émarger');
    const firstCheckInButton = checkInButtons[0];
    expect(firstCheckInButton).toBeDefined();
    if (firstCheckInButton === undefined) {
      throw new Error('Check-in button not found');
    }
    fireEvent.press(firstCheckInButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        checkedUserIds: ['user-2'],
        uncheckedUserIds: [],
      });
    });
  });
});
