import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { createPostWeb } from '@/api/post/__tests__/post-web.factory';
import * as mockPostCard from './post-card-stub.mock';
import { ProfilePosts } from '../profile-posts';

jest.mock('@/components/post/AppPost', () => ({
  __esModule: true,
  default: mockPostCard.PostCardStub,
}));

const mockFetchNextPage = jest.fn();

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

  it('shows the posts of the user', () => {
    const { getByText } = renderPosts({
      posts: [
        createPostWeb({ id: 'post-1', title: 'Premier post' }),
        createPostWeb({ id: 'post-2', title: 'Second post' }),
      ],
    });

    expect(getByText('Premier post')).toBeTruthy();
    expect(getByText('Second post')).toBeTruthy();
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
});
