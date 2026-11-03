import { QueryClient } from '@tanstack/react-query';
import {
  cancelLikesSummary,
  invalidateLikesSummary,
  likeSummaryKey,
  likesSummaryChunkKey,
  patchLikeSummary,
  writeLikeSummaries,
} from '../likes-summary.cache';

const clients: QueryClient[] = [];

const createClient = (): QueryClient => {
  const client = new QueryClient();
  clients.push(client);
  return client;
};

describe('likes summary cache helpers', () => {
  afterEach(() => {
    clients.splice(0).forEach((client) => {
      client.clear();
    });
  });

  it('writes one cache entry per post', () => {
    const client = createClient();
    writeLikeSummaries(client, [
      { postId: 'a', likeCount: 1, likedByMe: true },
      { postId: 'b', likeCount: 2, likedByMe: false },
    ]);

    expect(client.getQueryData(likeSummaryKey('a'))).toEqual({
      postId: 'a',
      likeCount: 1,
      likedByMe: true,
    });
    expect(client.getQueryData(likeSummaryKey('b'))).toEqual({
      postId: 'b',
      likeCount: 2,
      likedByMe: false,
    });
  });

  it('patches only a known summary and returns the previous one', () => {
    const client = createClient();
    expect(patchLikeSummary(client, 'a', (current) => current)).toBeUndefined();
    expect(client.getQueryData(likeSummaryKey('a'))).toBeUndefined();

    writeLikeSummaries(client, [{ postId: 'a', likeCount: 1, likedByMe: false }]);
    const previous = patchLikeSummary(client, 'a', (current) => ({
      ...current,
      likeCount: current.likeCount + 1,
    }));

    expect(previous?.likeCount).toBe(1);
    expect(client.getQueryData<{ likeCount: number }>(likeSummaryKey('a'))?.likeCount).toBe(2);
  });

  it('invalidates the post entry and the batches containing it, not the others', () => {
    const client = createClient();
    client.setQueryData(likeSummaryKey('a'), { postId: 'a', likeCount: 1, likedByMe: false });
    client.setQueryData(likeSummaryKey('z'), { postId: 'z', likeCount: 1, likedByMe: false });
    client.setQueryData(likesSummaryChunkKey(['a', 'b']), []);
    client.setQueryData(likesSummaryChunkKey(['y', 'z']), []);
    client.setQueryData(['post-likers', 'a'], []);

    invalidateLikesSummary(client, 'a');

    const stale = (key: readonly unknown[]): boolean | undefined =>
      client.getQueryState(key)?.isInvalidated;
    expect(stale(likeSummaryKey('a'))).toBe(true);
    expect(stale(likesSummaryChunkKey(['a', 'b']))).toBe(true);
    expect(stale(likeSummaryKey('z'))).toBe(false);
    expect(stale(likesSummaryChunkKey(['y', 'z']))).toBe(false);
    expect(stale(['post-likers', 'a'])).toBe(false);
  });

  it('resolves when cancelling queries of a post', async () => {
    const client = createClient();
    await expect(cancelLikesSummary(client, 'a')).resolves.toBeUndefined();
  });
});
