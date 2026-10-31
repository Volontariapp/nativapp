import React from 'react';
import { StyleSheet, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { fireEvent, render, renderHook } from '@testing-library/react-native';
import { createPostWeb } from '@/api/post/__tests__/post-web.factory';
import * as mockSafeArea from '@/components/post/__tests__/safe-area.mock';
import * as mockPostCard from './post-card-stub.mock';
import { computePostGridTileSize } from '@/components/post/post-grid.utils';
import { ProfilePosts } from '../profile-posts';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('react-native-safe-area-context', () => mockSafeArea);
jest.mock('@/components/post/AppPost', () => ({
  __esModule: true,
  default: mockPostCard.PostCardStub,
}));

type StyledElement = { props: { style?: StyleProp<ViewStyle> } };

const widthOf = (element: StyledElement): ViewStyle['width'] =>
  StyleSheet.flatten(element.props.style).width;

const mockFetchNextPage = jest.fn();
const mockOnCreatePress = jest.fn();

const useWindowDimensionsOnce = (): { width: number } => {
  const { result } = renderHook(() => useWindowDimensions());
  return result.current;
};

const renderPosts = (overrides: Partial<React.ComponentProps<typeof ProfilePosts>> = {}) =>
  render(
    <ProfilePosts
      posts={[]}
      isLoading={false}
      hasNextPage={false}
      fetchNextPage={mockFetchNextPage}
      isFetchingNextPage={false}
      {...overrides}
    />,
  );

describe('ProfilePosts', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows one tile per post of the user', () => {
    const { getByLabelText } = renderPosts({
      posts: [
        createPostWeb({ id: 'post-1', title: 'Premier post' }),
        createPostWeb({ id: 'post-2', title: 'Second post' }),
      ],
    });

    expect(getByLabelText('Ouvrir le post Premier post')).toBeTruthy();
    expect(getByLabelText('Ouvrir le post Second post')).toBeTruthy();
  });

  it('opens the post with its details when a tile is pressed, without a delete button', () => {
    const { getByLabelText, getByText, queryByText } = renderPosts({
      posts: [createPostWeb({ id: 'post-1', title: 'Premier post' })],
    });
    expect(queryByText('Premier post')).toBeNull();

    fireEvent.press(getByLabelText('Ouvrir le post Premier post'));

    expect(getByText('Premier post')).toBeTruthy();
    expect(queryByText('Supprimer')).toBeNull();
  });

  it('says so when the user has no post', () => {
    const { getByText } = renderPosts();

    expect(getByText('Aucun post pour le moment.')).toBeTruthy();
  });

  it('does not claim the user has no post while loading', () => {
    const { queryByText } = renderPosts({ isLoading: true });

    expect(queryByText('Aucun post pour le moment.')).toBeNull();
  });

  it('loads the next page on demand', () => {
    const { getByText } = renderPosts({
      posts: [createPostWeb({ title: 'Premier post' })],
      hasNextPage: true,
    });

    fireEvent.press(getByText('Voir plus'));

    expect(mockFetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('hides the load more button when there is no next page', () => {
    const { queryByText } = renderPosts({ posts: [createPostWeb({ title: 'Premier post' })] });

    expect(queryByText('Voir plus')).toBeNull();
  });

  it('sizes the tiles for the width left inside the content margins', () => {
    const CONTENT_INSET = 24;
    const { width } = useWindowDimensionsOnce();
    const { getByLabelText } = renderPosts({
      posts: [createPostWeb({ id: 'post-1', title: 'Premier post' })],
      contentInset: CONTENT_INSET,
    });

    const tile = getByLabelText('Ouvrir le post Premier post');

    expect(widthOf(tile)).toBe(computePostGridTileSize(width - CONTENT_INSET * 2));
  });

  it('offers to create a post next to the existing ones', () => {
    const { getByText } = renderPosts({
      posts: [createPostWeb({ title: 'Premier post' })],
      onCreatePress: mockOnCreatePress,
    });

    fireEvent.press(getByText('Nouveau post'));

    expect(mockOnCreatePress).toHaveBeenCalledTimes(1);
  });

  it('invites the user to write a first post when there is none', () => {
    const { getByText, queryByText } = renderPosts({ onCreatePress: mockOnCreatePress });

    fireEvent.press(getByText('Créer mon premier post'));

    expect(mockOnCreatePress).toHaveBeenCalledTimes(1);
    expect(queryByText('Nouveau post')).toBeNull();
  });

  it('shows no create button when no shortcut is given (public profile)', () => {
    const { queryByText } = renderPosts({ posts: [createPostWeb({ title: 'Premier post' })] });

    expect(queryByText('Nouveau post')).toBeNull();
    expect(queryByText('Créer mon premier post')).toBeNull();
  });
});
