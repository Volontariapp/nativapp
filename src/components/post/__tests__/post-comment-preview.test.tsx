import React from 'react';
import { render } from '@testing-library/react-native';
import { mockUseGetPublicUser } from '@/api/user/__tests__/user.mock';
import { AVATAR_URL, createUserPublicProfile } from '@/api/user/__tests__/user.factory';
import { DELETED_USER_ID } from '@/shared/lib/user.constants';
import { createComment } from './comment.factory';
import { PostCommentPreview } from '../PostCommentPreview';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@/api/user/hooks/use-get-public-user', () => ({
  useGetPublicUser: mockUseGetPublicUser,
}));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: jest.fn() }) }));

describe('PostCommentPreview', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows the photo of the comment author', () => {
    mockUseGetPublicUser.mockReturnValue({
      data: createUserPublicProfile({ avatarUrl: AVATAR_URL }),
      isLoading: false,
    });

    const { getByTestId } = render(<PostCommentPreview comment={createComment()} />);

    expect(getByTestId('user-avatar-image').props.source).toEqual({ uri: AVATAR_URL });
  });

  it('shows a neutral placeholder when the author has no photo', () => {
    mockUseGetPublicUser.mockReturnValue({ data: createUserPublicProfile(), isLoading: false });

    const { getByTestId } = render(<PostCommentPreview comment={createComment()} />);

    expect(getByTestId('user-avatar-placeholder')).toBeTruthy();
  });

  it('shows a neutral placeholder for a deleted user without loading a profile', () => {
    mockUseGetPublicUser.mockReturnValue({ data: undefined, isLoading: false });

    const { getByTestId } = render(
      <PostCommentPreview comment={createComment({ authorId: DELETED_USER_ID })} />,
    );

    expect(getByTestId('user-avatar-placeholder')).toBeTruthy();
    expect(mockUseGetPublicUser).toHaveBeenCalledWith(undefined);
  });
});
