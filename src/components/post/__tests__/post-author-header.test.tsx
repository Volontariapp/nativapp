import React from 'react';
import { render } from '@testing-library/react-native';
import { PostAuthorHeader } from '../PostAuthorHeader';

jest.mock('expo-image', () => ({ Image: 'Image' }));

const PHOTO_URL = 'https://cdn.test/user-avatar/5d0e4a3c.webp';

describe('PostAuthorHeader', () => {
  it('shows the photo of the author', () => {
    const { getByTestId, getByText } = render(
      <PostAuthorHeader pseudo="john_doe" authorId="author-1" avatarUrl={PHOTO_URL} />,
    );

    expect(getByTestId('user-avatar-image').props.source).toEqual({ uri: PHOTO_URL });
    expect(getByText('john_doe')).toBeTruthy();
  });

  it('shows a neutral placeholder, not a stranger face, when the author has no photo', () => {
    const { getByTestId, queryByTestId } = render(
      <PostAuthorHeader pseudo="john_doe" authorId="author-1" />,
    );

    expect(getByTestId('user-avatar-placeholder')).toBeTruthy();
    expect(queryByTestId('user-avatar-image')).toBeNull();
  });
});
