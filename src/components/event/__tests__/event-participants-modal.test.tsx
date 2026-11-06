import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import type { UserWeb } from '@volontariapp/contracts';
import { createUserWeb } from '@/api/user/__tests__/user.factory';
import { AuthContext } from '@/context/AuthContext';
import type { AuthContextValue } from '@/context/auth/auth.types';
import { EventParticipantsModal } from '../EventParticipantsModal';

jest.mock('expo-image', () => ({ Image: 'Image' }));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const mockParticipantsQuery = jest.fn();
jest.mock('@/api/event/hooks/use-infinite-event-participants', () => ({
  useInfiniteEventParticipants: (eventId?: string): unknown => mockParticipantsQuery(eventId),
}));

const mockFollowedIds = jest.fn();
jest.mock('@/api/social/hooks/use-my-followed-ids', () => ({
  useMyFollowedIds: (enabled?: boolean): unknown => mockFollowedIds(enabled),
}));

jest.mock('@/api/social/hooks/use-get-is-following', () => ({
  useGetIsFollowing: (): unknown => ({ data: undefined, isLoading: false }),
}));

const mockFollow = jest.fn();
jest.mock('@/api/social/hooks/use-user-social-actions', () => ({
  useUserSocialActions: () => ({
    follow: mockFollow,
    unfollow: jest.fn(),
    isFollowingPending: false,
    isUnfollowingPending: false,
  }),
}));

const authValue: AuthContextValue = {
  userId: 'me',
  role: null,
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
};

const people = (...ids: string[]): UserWeb[] =>
  ids.map((id) => createUserWeb({ id, pseudo: `pseudo-${id}`, totalImpactScore: 0 }));

const participantsResult = (users: UserWeb[], totalCount = users.length) => ({
  data: { pages: [{ participants: users, totalCount }], pageParams: [1] },
  isLoading: false,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
});

const followedResult = (ids: string[], isLoading = false) => ({
  followedIds: new Set(ids),
  isLoading,
});

const renderModal = (visible = true, onClose = jest.fn()) =>
  render(
    <AuthContext.Provider value={authValue}>
      <EventParticipantsModal eventId="event-1" visible={visible} onClose={onClose} />
    </AuthContext.Provider>,
  );

const rowIds = (screen: ReturnType<typeof render>): string[] =>
  screen
    .queryAllByTestId(/^participants-modal-row-/)
    .map((row) => String(row.props.testID).replace('participants-modal-row-', ''));

describe('EventParticipantsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFollow.mockResolvedValue({ success: true });
    mockParticipantsQuery.mockReturnValue(participantsResult(people('a', 'b', 'c', 'd')));
    mockFollowedIds.mockReturnValue(followedResult(['d', 'b']));
  });

  it('lists the people I follow first, then the others', () => {
    const screen = renderModal();

    expect(rowIds(screen)).toEqual(['b', 'd', 'a', 'c']);
    expect(screen.getByText('Vous suivez (2)')).toBeTruthy();
    expect(screen.getByText('Autres participants (2)')).toBeTruthy();
  });

  it('shows Suivi for the people I follow and Suivre for the others', () => {
    const screen = renderModal();

    expect(screen.getAllByText('Suivi')).toHaveLength(2);
    expect(screen.getAllByText('Suivre')).toHaveLength(2);
  });

  it('follows someone from the list', () => {
    const screen = renderModal();

    fireEvent.press(screen.getAllByText('Suivre')[0] as never);

    expect(mockFollow).toHaveBeenCalledWith('a');
  });

  it('marks my own row and gives it no follow button', () => {
    mockParticipantsQuery.mockReturnValue(participantsResult(people('a', 'me')));
    mockFollowedIds.mockReturnValue(followedResult([]));

    const screen = renderModal();

    expect(screen.getByText('Vous')).toBeTruthy();
    expect(screen.queryAllByTestId('post-follow-button')).toHaveLength(1);
  });

  it('opens the profile of a participant and closes the list', () => {
    const onClose = jest.fn();
    const screen = renderModal(true, onClose);

    fireEvent.press(screen.getByTestId('participants-modal-row-a'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('PublicProfile', { userId: 'a' });
  });

  it('shows the total number of participants in the title', () => {
    mockParticipantsQuery.mockReturnValue(participantsResult(people('a', 'b'), 7));

    const screen = renderModal();

    expect(screen.getByText('Participants (7)')).toBeTruthy();
  });

  it('waits for my follows before showing a list, so the order never jumps', () => {
    mockFollowedIds.mockReturnValue(followedResult([], true));

    const screen = renderModal();

    expect(screen.getByTestId('participants-modal-loader')).toBeTruthy();
    expect(rowIds(screen)).toEqual([]);
  });

  it('keeps the order while I follow someone from the list', () => {
    const screen = renderModal();
    expect(rowIds(screen)).toEqual(['b', 'd', 'a', 'c']);

    mockFollowedIds.mockReturnValue(followedResult(['d', 'b', 'c']));
    screen.rerender(
      <AuthContext.Provider value={authValue}>
        <EventParticipantsModal eventId="event-1" visible onClose={jest.fn()} />
      </AuthContext.Provider>,
    );

    expect(rowIds(screen)).toEqual(['b', 'd', 'a', 'c']);
    expect(screen.getAllByText('Suivi')).toHaveLength(3);
  });

  it('says so when nobody joined yet', () => {
    mockParticipantsQuery.mockReturnValue(participantsResult([]));

    const screen = renderModal();

    expect(screen.getByText('Aucun participant pour le moment.')).toBeTruthy();
  });

  it('does not load anything while closed', () => {
    renderModal(false);

    expect(mockParticipantsQuery).toHaveBeenCalledWith(undefined);
    expect(mockFollowedIds).toHaveBeenCalledWith(false);
  });

  it('closes from the close button', () => {
    const onClose = jest.fn();
    const screen = renderModal(true, onClose);

    fireEvent.press(screen.getByTestId('participants-modal-close'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
