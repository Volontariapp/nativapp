import React, { act } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useLikePost } from '../hooks/use-like-post';
import { useUnlikePost } from '../hooks/use-unlike-post';
import { usePostLikeSummary } from '../hooks/use-likes-summary';
import { likeSummaryKey } from '../likes-summary.cache';
import type { PostLikeSummary } from '../likes-summary.types';

const mockLikePost = jest.fn<Promise<{ success: boolean }>, [string]>();
const mockUnlikePost = jest.fn<Promise<{ success: boolean }>, [string]>();
jest.mock('../social.api', () => ({
  socialApi: {
    likePost: (postId: string) => mockLikePost(postId),
    unlikePost: (postId: string) => mockUnlikePost(postId),
  },
}));

interface Deferred {
  promise: Promise<{ success: boolean }>;
  resolve: () => void;
  reject: () => void;
}

const deferred = (): Deferred => {
  let resolve: () => void = () => undefined;
  let reject: () => void = () => undefined;
  const promise = new Promise<{ success: boolean }>((res, rej) => {
    resolve = () => {
      res({ success: true });
    };
    reject = () => {
      rej(new Error('boom'));
    };
  });
  return { promise, resolve, reject };
};

const seed = (client: QueryClient, summary: PostLikeSummary): void => {
  client.setQueryData(likeSummaryKey(summary.postId), summary);
};

const clients: QueryClient[] = [];

const setup = (initial: PostLikeSummary | undefined) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  if (initial) seed(client, initial);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const hook = renderHook(
    () => ({
      summary: usePostLikeSummary('p1'),
      like: useLikePost(),
      unlike: useUnlikePost(),
    }),
    { wrapper },
  );
  return { client, hook };
};

describe('like and unlike optimistic updates on the summary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    clients.splice(0).forEach((client) => {
      client.clear();
    });
  });

  it('increments the count and sets likedByMe right when liking, then keeps it on success', async () => {
    const request = deferred();
    mockLikePost.mockReturnValue(request.promise);
    const { hook } = setup({ postId: 'p1', likeCount: 4, likedByMe: false });

    act(() => {
      hook.result.current.like.mutate('p1');
    });

    await waitFor(() => {
      expect(hook.result.current.summary.data).toEqual({
        postId: 'p1',
        likeCount: 5,
        likedByMe: true,
      });
    });
    await act(async () => {
      request.resolve();
      await request.promise;
    });
    expect(hook.result.current.summary.data).toEqual({
      postId: 'p1',
      likeCount: 5,
      likedByMe: true,
    });
  });

  it('decrements the count and clears likedByMe right when unliking', async () => {
    const request = deferred();
    mockUnlikePost.mockReturnValue(request.promise);
    const { hook } = setup({ postId: 'p1', likeCount: 1, likedByMe: true });

    act(() => {
      hook.result.current.unlike.mutate('p1');
    });

    await waitFor(() => {
      expect(hook.result.current.summary.data).toEqual({
        postId: 'p1',
        likeCount: 0,
        likedByMe: false,
      });
    });
    await act(async () => {
      request.resolve();
      await request.promise;
    });
  });

  it('never goes below zero when unliking', async () => {
    const request = deferred();
    mockUnlikePost.mockReturnValue(request.promise);
    const { hook } = setup({ postId: 'p1', likeCount: 0, likedByMe: true });

    act(() => {
      hook.result.current.unlike.mutate('p1');
    });

    await waitFor(() => {
      expect(hook.result.current.summary.data?.likedByMe).toBe(false);
    });
    expect(hook.result.current.summary.data?.likeCount).toBe(0);
    await act(async () => {
      request.resolve();
      await request.promise;
    });
  });

  it('rolls the summary back when the like fails', async () => {
    const request = deferred();
    mockLikePost.mockReturnValue(request.promise);
    const { hook } = setup({ postId: 'p1', likeCount: 4, likedByMe: false });

    act(() => {
      hook.result.current.like.mutate('p1');
    });
    await waitFor(() => {
      expect(hook.result.current.summary.data?.likeCount).toBe(5);
    });
    await act(async () => {
      request.reject();
      await request.promise.catch(() => undefined);
    });

    await waitFor(() => {
      expect(hook.result.current.summary.data).toEqual({
        postId: 'p1',
        likeCount: 4,
        likedByMe: false,
      });
    });
  });

  it('rolls the summary back when the unlike fails', async () => {
    const request = deferred();
    mockUnlikePost.mockReturnValue(request.promise);
    const { hook } = setup({ postId: 'p1', likeCount: 4, likedByMe: true });

    act(() => {
      hook.result.current.unlike.mutate('p1');
    });
    await waitFor(() => {
      expect(hook.result.current.summary.data?.likeCount).toBe(3);
    });
    await act(async () => {
      request.reject();
      await request.promise.catch(() => undefined);
    });

    await waitFor(() => {
      expect(hook.result.current.summary.data).toEqual({
        postId: 'p1',
        likeCount: 4,
        likedByMe: true,
      });
    });
  });

  it('does not invent a summary when none is known', async () => {
    const request = deferred();
    mockLikePost.mockReturnValue(request.promise);
    const { hook } = setup(undefined);

    act(() => {
      hook.result.current.like.mutate('p1');
    });
    await act(async () => {
      request.resolve();
      await request.promise;
    });

    expect(hook.result.current.summary.data).toBeUndefined();
  });
});
