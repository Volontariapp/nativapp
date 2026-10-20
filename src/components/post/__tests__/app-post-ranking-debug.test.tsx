import React from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppPost from '../AppPost';
import { useDebug } from '@/context/DebugContext';
import type { RankedAppPost } from '@/api/ranking';

import { mockUseGetPublicUser } from '@/api/user/__tests__/user.mock';
import { createUserPublicProfile } from '@/api/user/__tests__/user.factory';

jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@/context/DebugContext', () => ({
  useDebug: jest.fn(),
}));
jest.mock('@/api/user/hooks/use-get-public-user', () => ({
  useGetPublicUser: (userId?: string) => mockUseGetPublicUser(userId),
}));
jest.mock('@/api/post/hooks/use-list-comments', () => ({
  useListComments: jest.fn(),
}));
jest.mock('@/api/social/hooks/use-get-my-likes', () => ({
  useGetMyLikes: jest.fn(),
}));
jest.mock('@/api/user/hooks/use-get-post-likers', () => ({
  useGetPostLikers: jest.fn(),
}));
jest.mock('@/api/social/hooks/use-like-post', () => ({
  useLikePost: jest.fn(),
}));
jest.mock('@/api/social/hooks/use-unlike-post', () => ({
  useUnlikePost: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

import { useListComments } from '@/api/post/hooks/use-list-comments';
import { useGetMyLikes } from '@/api/social/hooks/use-get-my-likes';
import { useGetPostLikers } from '@/api/user/hooks/use-get-post-likers';
import { useLikePost } from '@/api/social/hooks/use-like-post';
import { useUnlikePost } from '@/api/social/hooks/use-unlike-post';

const mockUseDebug = jest.mocked(useDebug);
const mockUseListComments = jest.mocked(useListComments);
const mockUseGetMyLikes = jest.mocked(useGetMyLikes);
const mockUseGetPostLikers = jest.mocked(useGetPostLikers);
const mockUseLikePost = jest.mocked(useLikePost);
const mockUseUnlikePost = jest.mocked(useUnlikePost);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const baseRankedPost: RankedAppPost = {
  id: 'post-test-1',
  title: 'Post avec explications de score',
  content: 'Description du post pour le test de ranking',
  authorId: 'author-uuid-1',
  createdAt: new Date('2026-10-20T10:00:00.000Z'),
  updatedAt: new Date('2026-10-20T10:00:00.000Z'),
  media: [],
  mediaStatus: 'NONE',
  rankingScore: 78.4,
  reasons: ['FOLLOWED_AUTHOR', 'RECENT'],
};

describe('AppPost ranking debug display', () => {
  beforeEach(() => {
    mockUseGetPublicUser.mockReturnValue({
      data: createUserPublicProfile({ id: 'author-uuid-1', pseudo: 'alice' }),
      isLoading: false,
    });
    mockUseListComments.mockReturnValue({
      data: { comments: [], totalCount: 0 },
      isLoading: false,
    } as unknown as ReturnType<typeof useListComments>);
    mockUseGetMyLikes.mockReturnValue({
      data: { ids: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof useGetMyLikes>);
    mockUseGetPostLikers.mockReturnValue({
      data: { users: [], totalCount: 0 },
      isLoading: false,
    } as unknown as ReturnType<typeof useGetPostLikers>);
    mockUseLikePost.mockReturnValue({ mutate: jest.fn() } as unknown as ReturnType<
      typeof useLikePost
    >);
    mockUseUnlikePost.mockReturnValue({ mutate: jest.fn() } as unknown as ReturnType<
      typeof useUnlikePost
    >);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('hides ranking score and reasons when debug mode is disabled', () => {
    mockUseDebug.mockReturnValue({ isDebugMode: false, toggleDebugMode: jest.fn() });

    const { queryByText, queryByTestId } = render(<AppPost post={baseRankedPost} />, {
      wrapper: createWrapper(),
    });

    expect(queryByTestId('post-debug-ranking-container')).toBeNull();
    expect(queryByText(/Score:/i)).toBeNull();
    expect(queryByText('Organisateur suivi')).toBeNull();
    expect(queryByText('Nouveau')).toBeNull();
  });

  it('displays ranking score and mapped reason labels when debug mode is enabled', () => {
    mockUseDebug.mockReturnValue({ isDebugMode: true, toggleDebugMode: jest.fn() });

    const { getByText, getByTestId } = render(<AppPost post={baseRankedPost} />, {
      wrapper: createWrapper(),
    });

    expect(getByTestId('post-debug-ranking-container')).toBeTruthy();
    expect(getByText('Score: 78.4')).toBeTruthy();
    expect(getByText('Organisateur suivi')).toBeTruthy();
    expect(getByText('Nouveau')).toBeTruthy();
  });
});
