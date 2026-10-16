import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { UserAvatar } from '../UserAvatar';

jest.mock('expo-image', () => ({ Image: 'Image' }));

const PHOTO_URL = 'https://cdn.test/user-avatar/5d0e4a3c.webp';

describe('UserAvatar', () => {
  it('shows the photo from its URL', () => {
    const { getByTestId, queryByTestId } = render(<UserAvatar uri={PHOTO_URL} size={40} />);

    expect(getByTestId('user-avatar-image').props.source).toEqual({ uri: PHOTO_URL });
    expect(queryByTestId('user-avatar-placeholder')).toBeNull();
  });

  it('shows a neutral placeholder when there is no photo', () => {
    const { getByTestId, queryByTestId } = render(<UserAvatar uri={undefined} size={40} />);

    expect(getByTestId('user-avatar-placeholder')).toBeTruthy();
    expect(queryByTestId('user-avatar-image')).toBeNull();
  });

  it('treats an empty URL as no photo', () => {
    const { getByTestId } = render(<UserAvatar uri="" size={40} />);

    expect(getByTestId('user-avatar-placeholder')).toBeTruthy();
  });

  it('is a circle of the requested size', () => {
    const { getByTestId } = render(<UserAvatar uri={PHOTO_URL} size={40} />);

    expect(StyleSheet.flatten(getByTestId('user-avatar').props.style)).toMatchObject({
      width: 40,
      height: 40,
      borderRadius: 20,
    });
  });
});
