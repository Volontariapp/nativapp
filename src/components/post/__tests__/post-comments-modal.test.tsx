import React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { render } from '@testing-library/react-native';
import { createComment } from './comment.factory';
import {
  mockCommentItem,
  mockFetchNextPage,
  mockUseCreateComment,
  mockUseInfiniteComments,
} from './post-comments-modal.mock';
import { PostCommentsModal } from '../PostCommentsModal';

jest.mock('@/api/post/hooks/use-infinite-comments', () => ({
  useInfiniteComments: mockUseInfiniteComments,
}));
jest.mock('@/api/post/hooks/use-create-comment', () => ({
  useCreateComment: mockUseCreateComment,
}));
jest.mock('../CommentItem', () => ({ CommentItem: mockCommentItem }));

const withPages = (overrides: Record<string, unknown> = {}) => ({
  data: {
    pages: [
      { comments: [createComment({ id: 'c1', content: 'Premier' })] },
      { comments: [createComment({ id: 'c2', content: 'Second' })] },
    ],
  },
  isLoading: false,
  hasNextPage: true,
  isFetchingNextPage: false,
  fetchNextPage: mockFetchNextPage,
  ...overrides,
});

describe('PostCommentsModal pagination', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('shows the comments of every loaded page', () => {
    mockUseInfiniteComments.mockReturnValue(withPages());

    const { getByText } = render(<PostCommentsModal postId="p1" visible onClose={jest.fn()} />);

    expect(getByText('Premier')).toBeTruthy();
    expect(getByText('Second')).toBeTruthy();
  });

  it('asks for the next page when the end of the list is reached', () => {
    mockUseInfiniteComments.mockReturnValue(withPages());
    const { UNSAFE_getByType } = render(
      <PostCommentsModal postId="p1" visible onClose={jest.fn()} />,
    );

    const list = UNSAFE_getByType(FlatList);
    (list.props.onEndReached as () => void)();

    expect(list.props.onEndReachedThreshold).toBe(0.5);
    expect(mockFetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('does not fetch while a page is loading or when the list is complete', () => {
    mockUseInfiniteComments.mockReturnValue(withPages({ isFetchingNextPage: true }));
    const loading = render(<PostCommentsModal postId="p1" visible onClose={jest.fn()} />);
    (loading.UNSAFE_getByType(FlatList).props.onEndReached as () => void)();

    mockUseInfiniteComments.mockReturnValue(withPages({ hasNextPage: false }));
    const done = render(<PostCommentsModal postId="p1" visible onClose={jest.fn()} />);
    (done.UNSAFE_getByType(FlatList).props.onEndReached as () => void)();

    expect(mockFetchNextPage).not.toHaveBeenCalled();
  });

  it('shows a footer loader while the next page loads', () => {
    mockUseInfiniteComments.mockReturnValue(withPages({ isFetchingNextPage: true }));
    const { UNSAFE_getAllByType } = render(
      <PostCommentsModal postId="p1" visible onClose={jest.fn()} />,
    );

    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });
});
