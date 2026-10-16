import React from 'react';
import { render } from '@testing-library/react-native';
import { mockUseGetPublicUser } from '@/api/user/__tests__/user.mock';
import { AVATAR_URL, createUserPublicProfile } from '@/api/user/__tests__/user.factory';
import { EventOrganizer } from '../EventOrganizer';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@/api/user/hooks/use-get-public-user', () => ({
  useGetPublicUser: mockUseGetPublicUser,
}));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: jest.fn() }) }));

describe('EventOrganizer', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows the photo of the organizer', () => {
    mockUseGetPublicUser.mockReturnValue({
      data: createUserPublicProfile({ avatarUrl: AVATAR_URL }),
      isLoading: false,
    });

    const { getByTestId } = render(<EventOrganizer organizerId="organizer-1" />);

    expect(getByTestId('user-avatar-image').props.source).toEqual({ uri: AVATAR_URL });
  });

  it('falls back to the legacy logo of an organizer without a new photo', () => {
    mockUseGetPublicUser.mockReturnValue({
      data: createUserPublicProfile({ logoPath: 'https://cdn.test/legacy-logo.png' }),
      isLoading: false,
    });

    const { getByTestId } = render(<EventOrganizer organizerId="organizer-1" />);

    expect(getByTestId('user-avatar-image').props.source).toEqual({
      uri: 'https://cdn.test/legacy-logo.png',
    });
  });

  it('shows a neutral placeholder when the organizer has no image at all', () => {
    mockUseGetPublicUser.mockReturnValue({ data: createUserPublicProfile(), isLoading: false });

    const { getByTestId } = render(<EventOrganizer organizerId="organizer-1" />);

    expect(getByTestId('user-avatar-placeholder')).toBeTruthy();
  });
});
