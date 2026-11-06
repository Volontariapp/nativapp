import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { act } from 'react';
import { mockUseEventParticipants } from '@/api/user/__tests__/user.mock';
import { AVATAR_URL, createUserPublicProfile } from '@/api/user/__tests__/user.factory';
import { createMockAppEvent } from '@/components/post/__tests__/event.factory';
import { EventParticipants } from '../EventParticipants';

jest.mock('expo-image', () => ({ Image: 'Image' }));

const mockModal = jest.fn();
jest.mock('../EventParticipantsModal', () => ({
  EventParticipantsModal: (props: unknown): null => {
    mockModal(props);
    return null;
  },
}));
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

  describe('full list of participants', () => {
    const lastModalProps = (): { visible: boolean; eventId: string; onClose: () => void } =>
      (mockModal.mock.calls.at(-1) as [{ visible: boolean; eventId: string; onClose: () => void }])[0];

    beforeEach(() => {
      mockUseEventParticipants.mockReturnValue({ data: undefined });
    });

    it('does not load the full list until the user asks for it', () => {
      render(<EventParticipants event={event} />);

      expect(mockModal).not.toHaveBeenCalled();
    });

    it('opens the full list from the "voir plus" link', () => {
      const { getByText } = render(<EventParticipants event={event} />);

      fireEvent.press(getByText('voir plus'));

      expect(lastModalProps()).toMatchObject({ visible: true, eventId: 'event-9' });
    });

    it('opens the full list when the avatars are pressed', () => {
      const { getByTestId } = render(<EventParticipants event={event} />);

      fireEvent.press(getByTestId('event-participants-preview'));

      expect(lastModalProps()).toMatchObject({ visible: true, eventId: 'event-9' });
    });

    it('closes the full list and keeps it mounted for the slide-out animation', () => {
      const { getByText } = render(<EventParticipants event={event} />);
      fireEvent.press(getByText('voir plus'));

      act(() => {
        lastModalProps().onClose();
      });

      expect(lastModalProps().visible).toBe(false);
    });

    it('lets the caller take over when it gives its own handler', () => {
      const onSeeMorePress = jest.fn();
      const { getByText } = render(
        <EventParticipants event={event} onSeeMorePress={onSeeMorePress} />,
      );

      fireEvent.press(getByText('voir plus'));

      expect(onSeeMorePress).toHaveBeenCalledTimes(1);
      expect(mockModal).not.toHaveBeenCalled();
    });
  });
});
