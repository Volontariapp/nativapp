import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { createPostWeb } from '@/api/post/__tests__/post-web.factory';
import { postApi } from '../../post.api';
import { MY_POSTS_PAGE_SIZE, useGetMyPosts } from '../use-get-my-posts';

jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ userId: 'user-1' }) }));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useGetMyPosts', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exposes the error instead of swallowing it into an empty page', async () => {
    jest.spyOn(postApi, 'getMyPosts').mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useGetMyPosts(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.data).toBeUndefined();
  });

  it('always requests the shared page size', async () => {
    const spy = jest.spyOn(postApi, 'getMyPosts').mockResolvedValue({
      posts: [createPostWeb({ id: 'post-1' })],
      totalCount: 1,
    });

    const { result } = renderHook(() => useGetMyPosts(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(spy).toHaveBeenCalledWith({ page: 1, limit: MY_POSTS_PAGE_SIZE, authorId: 'user-1' });
    expect(result.current.hasNextPage).toBe(false);
  });
});
