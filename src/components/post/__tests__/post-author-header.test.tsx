import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { render } from '@testing-library/react-native';
import { useUserDistinction } from '@/api/user/hooks/use-user-distinction';
import { lightTheme } from '@/shared/themes/theme';
import { PostAuthorHeader } from '../PostAuthorHeader';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@/api/user/hooks/use-user-distinction', () => ({
  useUserDistinction: jest.fn(),
}));

const mockedUseUserDistinction = jest.mocked(useUserDistinction);

const PHOTO_URL = 'https://cdn.test/user-avatar/5d0e4a3c.webp';

type ViewElement = { props: { style?: StyleProp<ViewStyle> } };

const styleOf = (element: ViewElement): ViewStyle => StyleSheet.flatten(element.props.style);

describe('PostAuthorHeader', () => {
  beforeEach(() => {
    mockedUseUserDistinction.mockReturnValue(undefined);
  });

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

  it('keeps the plain banner for an author who is not on a podium', () => {
    const { getByTestId } = render(<PostAuthorHeader pseudo="john_doe" authorId="author-1" />);

    expect(styleOf(getByTestId('post-author-header'))).toMatchObject({
      borderBottomWidth: 1,
      borderBottomColor: lightTheme.colors.lightGrey,
    });
  });

  it('frames only the banner, with square corners, for the global first', () => {
    mockedUseUserDistinction.mockReturnValue({ scope: 'global', tier: 1 });

    const { getByTestId } = render(<PostAuthorHeader pseudo="john_doe" authorId="author-1" />);

    const style = styleOf(getByTestId('post-author-header'));
    expect(style).toMatchObject({
      borderColor: lightTheme.colors.gold,
      borderWidth: 2,
      borderRadius: 0,
    });
    expect(style.shadowColor).toBeUndefined();
  });
});
