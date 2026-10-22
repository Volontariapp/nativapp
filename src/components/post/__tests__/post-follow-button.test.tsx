import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostFollowButton } from '../PostFollowButton';
import { PostAuthorHeader } from '../PostAuthorHeader';
import { AuthContext } from '@/context/AuthContext';
import { DELETED_USER_ID } from '@/shared/lib/user.constants';
import type { AuthContextValue } from '@/context/auth/auth.types';

jest.mock('expo-image', () => ({ Image: 'Image' }));

const mockUseGetIsFollowing = jest.fn();
const mockFollow = jest.fn();
const mockUnfollow = jest.fn();

jest.mock('@/api/social/hooks/use-get-is-following', () => ({
  useGetIsFollowing: (userId: string, enabled = true): unknown =>
    mockUseGetIsFollowing(userId, enabled),
}));

jest.mock('@/api/social/hooks/use-user-social-actions', () => ({
  useUserSocialActions: () => ({
    follow: mockFollow,
    unfollow: mockUnfollow,
    isFollowingPending: false,
    isUnfollowingPending: false,
  }),
}));

const createWrapper = (currentUserId?: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const authValue =
    typeof currentUserId === 'string' && currentUserId.length > 0
      ? ({
          userId: currentUserId,
          isAuthenticated: true,
          isLoading: false,
          accessToken: 'token',
          userRole: 'VOLUNTEER',
          login: jest.fn(),
          logout: jest.fn(),
        } as unknown as AuthContextValue)
      : undefined;

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe('PostFollowButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFollow.mockResolvedValue({ success: true });
    mockUnfollow.mockResolvedValue({ success: true });
  });

  it('renders nothing if current user is not logged in', () => {
    mockUseGetIsFollowing.mockReturnValue({
      data: { isFollowing: false },
      isLoading: false,
    });

    const { queryByTestId } = render(<PostFollowButton authorId="target-user-1" />, {
      wrapper: createWrapper(undefined),
    });

    expect(queryByTestId('post-follow-button')).toBeNull();
  });

  it('renders nothing on own posts (authorId === currentUserId)', () => {
    mockUseGetIsFollowing.mockReturnValue({
      data: { isFollowing: false },
      isLoading: false,
    });

    const { queryByTestId } = render(<PostFollowButton authorId="current-user-1" />, {
      wrapper: createWrapper('current-user-1'),
    });

    expect(queryByTestId('post-follow-button')).toBeNull();
  });

  it('renders nothing for deleted users (authorId === DELETED_USER_ID)', () => {
    mockUseGetIsFollowing.mockReturnValue({
      data: { isFollowing: false },
      isLoading: false,
    });

    const { queryByTestId } = render(<PostFollowButton authorId={DELETED_USER_ID} />, {
      wrapper: createWrapper('current-user-1'),
    });

    expect(queryByTestId('post-follow-button')).toBeNull();
  });

  it('renders "Suivre" when the user is not followed yet and triggers follow on click', async () => {
    mockUseGetIsFollowing.mockReturnValue({
      data: { isFollowing: false },
      isLoading: false,
    });

    const { getByTestId, getByText } = render(<PostFollowButton authorId="target-user-1" />, {
      wrapper: createWrapper('current-user-1'),
    });

    const button = getByTestId('post-follow-button');
    expect(getByText('Suivre')).toBeTruthy();

    fireEvent.press(button);

    await waitFor(() => {
      expect(mockFollow).toHaveBeenCalledWith('target-user-1');
      expect(getByText('Suivi')).toBeTruthy();
    });
  });

  it('renders "Suivi" when already following and triggers unfollow on click', async () => {
    mockUseGetIsFollowing.mockReturnValue({
      data: { isFollowing: true },
      isLoading: false,
    });

    const { getByTestId, getByText } = render(<PostFollowButton authorId="target-user-1" />, {
      wrapper: createWrapper('current-user-1'),
    });

    const button = getByTestId('post-follow-button');
    expect(getByText('Suivi')).toBeTruthy();

    fireEvent.press(button);

    await waitFor(() => {
      expect(mockUnfollow).toHaveBeenCalledWith('target-user-1');
      expect(getByText('Suivre')).toBeTruthy();
    });
  });

  it('renders correctly inside PostAuthorHeader with showFollowButton={true}', () => {
    mockUseGetIsFollowing.mockReturnValue({
      data: { isFollowing: false },
      isLoading: false,
    });

    const { getByTestId, getByText } = render(
      <PostAuthorHeader pseudo="alice" authorId="target-user-1" showFollowButton={true} />,
      {
        wrapper: createWrapper('current-user-1'),
      },
    );

    expect(getByText('alice')).toBeTruthy();
    expect(getByTestId('post-follow-button')).toBeTruthy();
    expect(getByText('Suivre')).toBeTruthy();
  });
});
