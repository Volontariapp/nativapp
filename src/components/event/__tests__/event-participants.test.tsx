import React from 'react';
import { render } from '@testing-library/react-native';
import { mockUseEventParticipants } from '@/api/user/__tests__/user.mock';
import { AVATAR_URL, createUserPublicProfile } from '@/api/user/__tests__/user.factory';
import { createMockAppEvent } from '@/components/post/__tests__/event.factory';
import { EventParticipants } from '../EventParticipants';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@/api/user/hooks/use-event-participants', () => ({
  useEventParticipants: mockUseEventParticipants,
}));

const event = createMockAppEvent({ id: 'event-9', currentParticipants: 7, maxParticipants: 10 });

describe('EventParticipants', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('loads the participants of the event', () => {
    mockUseEventParticipants.mockReturnValue({ data: undefined });

    render(<EventParticipants event={event} />);

    expect(mockUseEventParticipants).toHaveBeenCalledWith('event-9');
  });

  it('shows the real photos of the first participants and a placeholder for the others', () => {
    mockUseEventParticipants.mockReturnValue({
      data: [
        createUserPublicProfile({ id: 'p1', avatarUrl: AVATAR_URL }),
        createUserPublicProfile({ id: 'p2' }),
      ],
    });

    const { getAllByTestId, getByText } = render(<EventParticipants event={event} />);

    expect(getAllByTestId('user-avatar-image')).toHaveLength(1);
    expect(getAllByTestId('user-avatar-placeholder')).toHaveLength(4);
    expect(getByText('+2')).toBeTruthy();
  });

  it('shows only placeholders, no invented faces, while participants are not loaded', () => {
    mockUseEventParticipants.mockReturnValue({ data: undefined });

    const { queryAllByTestId, getAllByTestId } = render(<EventParticipants event={event} />);

    expect(queryAllByTestId('user-avatar-image')).toHaveLength(0);
    expect(getAllByTestId('user-avatar-placeholder')).toHaveLength(5);
  });
});
