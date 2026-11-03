import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { PostWeb } from '@volontariapp/contracts';
import { createPostWeb } from '@/api/post/__tests__/post-web.factory';
import * as mockPostCard from '@/components/profile/__tests__/post-card-stub.mock';
import * as mockSafeArea from '@/components/post/__tests__/safe-area.mock';
import * as mockMyPosts from './my-posts-screen.mock';
import { MyPostsScreen } from '../MyPostsScreen';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@/api/social/hooks/use-likes-summary', () => ({
  useLikesSummary: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => mockSafeArea);
jest.mock('@/components/layout/AppHeader', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/post/AppPost', () => ({
  __esModule: true,
  default: mockPostCard.PostCardStub,
}));
jest.mock('@/api/post/hooks', () => ({
  useGetMyPosts: () => mockMyPosts.mockMyPostsQuery,
  useDeletePost: () => ({ mutateAsync: mockMyPosts.mockDeletePost }),
}));

const setPosts = (posts: PostWeb[]): void => {
  mockMyPosts.mockMyPostsQuery.data = {
    pages: [{ posts, totalCount: posts.length, pagination: undefined }],
  };
};

describe('MyPostsScreen', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    mockMyPosts.mockMyPostsQuery.isLoading = false;
    mockMyPosts.mockMyPostsQuery.isError = false;
    mockMyPosts.mockMyPostsQuery.isFetchingNextPage = false;
    mockMyPosts.mockMyPostsQuery.hasNextPage = false;
    mockMyPosts.mockDeletePost.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('shows one tile per post in a grid', () => {
    setPosts([
      createPostWeb({ id: 'post-1', title: 'Premier post' }),
      createPostWeb({ id: 'post-2', title: 'Second post' }),
    ]);

    const { getByLabelText } = render(<MyPostsScreen />);

    expect(getByLabelText('Ouvrir le post Premier post')).toBeTruthy();
    expect(getByLabelText('Ouvrir le post Second post')).toBeTruthy();
  });

  it('says so when the user has no post', () => {
    setPosts([]);

    const { getByText } = render(<MyPostsScreen />);

    expect(getByText("Vous n'avez créé aucun post pour le moment.")).toBeTruthy();
  });

  it('opens the post with its details when a tile is pressed', () => {
    setPosts([createPostWeb({ id: 'post-1', title: 'Premier post' })]);
    const { getByLabelText, queryByText, getByText } = render(<MyPostsScreen />);
    expect(queryByText('Premier post')).toBeNull();

    fireEvent.press(getByLabelText('Ouvrir le post Premier post'));

    expect(getByText('Premier post')).toBeTruthy();
  });

  it('deletes the opened post once the user confirms', async () => {
    setPosts([createPostWeb({ id: 'post-1', title: 'Premier post' })]);
    const { getByLabelText, getByText } = render(<MyPostsScreen />);
    fireEvent.press(getByLabelText('Ouvrir le post Premier post'));

    fireEvent.press(getByText('Supprimer'));
    const [, , buttons] = jest.mocked(Alert.alert).mock.calls.at(-1) ?? [];
    buttons?.find((button) => button.style === 'destructive')?.onPress?.();

    await waitFor(() => {
      expect(mockMyPosts.mockDeletePost).toHaveBeenCalledWith('post-1');
    });
  });

  it('loads the next page when the end of the grid is reached', () => {
    setPosts([createPostWeb({ id: 'post-1' })]);
    mockMyPosts.mockMyPostsQuery.hasNextPage = true;
    const { getByTestId } = render(<MyPostsScreen />);

    fireEvent(getByTestId('my-posts-grid'), 'endReached');

    expect(mockMyPosts.mockFetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('does not request another page while one is already loading', () => {
    setPosts([createPostWeb({ id: 'post-1' })]);
    mockMyPosts.mockMyPostsQuery.hasNextPage = true;
    mockMyPosts.mockMyPostsQuery.isFetchingNextPage = true;
    const { getByTestId } = render(<MyPostsScreen />);

    fireEvent(getByTestId('my-posts-grid'), 'endReached');

    expect(mockMyPosts.mockFetchNextPage).not.toHaveBeenCalled();
  });

  it('uses the same end threshold as the other lists', () => {
    setPosts([createPostWeb({ id: 'post-1' })]);
    const { getByTestId } = render(<MyPostsScreen />);

    expect(getByTestId('my-posts-grid').props.onEndReachedThreshold).toBe(0.5);
  });

  it('shows an error message when the first load fails', () => {
    mockMyPosts.mockMyPostsQuery.data = undefined;
    mockMyPosts.mockMyPostsQuery.isError = true;

    const { getByText } = render(<MyPostsScreen />);

    expect(getByText('Erreur lors du chargement de vos posts.')).toBeTruthy();
  });

  it('deduplicates a post returned by two pages', () => {
    const post = createPostWeb({ id: 'post-1', title: 'Premier post' });
    mockMyPosts.mockMyPostsQuery.data = {
      pages: [
        { posts: [post], totalCount: 2, pagination: undefined },
        { posts: [post, createPostWeb({ id: 'post-2', title: 'Second post' })], totalCount: 2 },
      ],
    };

    const { getAllByLabelText } = render(<MyPostsScreen />);

    expect(getAllByLabelText('Ouvrir le post Premier post')).toHaveLength(1);
  });
});
