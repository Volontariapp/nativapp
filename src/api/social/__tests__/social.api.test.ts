import { apiFetch } from '../../client';
import { socialApi } from '../social.api';

jest.mock('../../client', () => ({ apiFetch: jest.fn() }));

const apiFetchMock = jest.mocked(apiFetch);

const ids = (prefix: string, count: number): string[] =>
  Array.from({ length: count }, (_, i) => `${prefix}-${String(i)}`);

const requestedLimits = (): string[] =>
  apiFetchMock.mock.calls.map(
    ([path]) => new URL(`http://x${path}`).searchParams.get('limit') ?? '',
  );

describe('socialApi.getMyLikes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('fetches every page of 100 until totalCount is reached', async () => {
    apiFetchMock
      .mockResolvedValueOnce({ ids: ids('a', 100), totalCount: 250 })
      .mockResolvedValueOnce({ ids: ids('b', 100), totalCount: 250 })
      .mockResolvedValueOnce({ ids: ids('c', 50), totalCount: 250 });

    const result = await socialApi.getMyLikes();

    expect(result.ids).toHaveLength(250);
    expect(result.totalCount).toBe(250);
    expect(apiFetchMock).toHaveBeenCalledTimes(3);
    expect(requestedLimits()).toEqual(['100', '100', '100']);
  });

  it('keeps the {ids, totalCount} shape for a single page', async () => {
    apiFetchMock.mockResolvedValueOnce({ ids: ids('a', 3), totalCount: 3 });
    expect(await socialApi.getMyLikes()).toEqual({ ids: ids('a', 3), totalCount: 3 });
    expect(apiFetchMock).toHaveBeenCalledTimes(1);
  });

  it('stops on an empty page even if totalCount is not reached', async () => {
    apiFetchMock
      .mockResolvedValueOnce({ ids: ids('a', 100), totalCount: 500 })
      .mockResolvedValueOnce({ ids: [], totalCount: 500 });

    const result = await socialApi.getMyLikes();

    expect(result.ids).toHaveLength(100);
    expect(apiFetchMock).toHaveBeenCalledTimes(2);
  });

  it('caps the total at 2000 ids', async () => {
    apiFetchMock.mockImplementation(() =>
      Promise.resolve({ ids: ids('x', 100), totalCount: 5000 }),
    );

    const result = await socialApi.getMyLikes();

    expect(result.ids).toHaveLength(2000);
    expect(apiFetchMock).toHaveBeenCalledTimes(20);
  });

  it('only fetches the requested page when params are given', async () => {
    apiFetchMock.mockResolvedValueOnce({ ids: ids('a', 5), totalCount: 500 });

    const result = await socialApi.getMyLikes({ page: 2, limit: 5 });

    expect(result.ids).toHaveLength(5);
    expect(apiFetchMock).toHaveBeenCalledTimes(1);
  });
});

const requestedPostIds = (options: { body?: unknown } | undefined): string[] => {
  const body = options?.body;
  if (
    typeof body === 'object' &&
    body !== null &&
    'postIds' in body &&
    Array.isArray(body.postIds)
  ) {
    return body.postIds.filter((id): id is string => typeof id === 'string');
  }
  return [];
};

describe('socialApi.getLikesSummary', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const summariesFor = (postIds: string[]) => ({
    summaries: postIds.map((postId) => ({ postId, likeCount: 1, likedByMe: false })),
  });

  it('posts the ids to the gateway route and returns the summaries', async () => {
    apiFetchMock.mockResolvedValueOnce(summariesFor(['p1', 'p2']));

    const result = await socialApi.getLikesSummary(['p1', 'p2']);

    expect(result.map((summary) => summary.postId)).toEqual(['p1', 'p2']);
    expect(apiFetchMock).toHaveBeenCalledWith('/social/likes-summary', {
      method: 'POST',
      requiresAuth: true,
      body: { postIds: ['p1', 'p2'] },
    });
  });

  it('splits more than 100 ids into several calls of 100 ids at most', async () => {
    apiFetchMock.mockImplementation((_path, options) =>
      Promise.resolve(summariesFor(requestedPostIds(options))),
    );

    const result = await socialApi.getLikesSummary(ids('p', 250));

    expect(result).toHaveLength(250);
    expect(apiFetchMock).toHaveBeenCalledTimes(3);
  });

  it('removes duplicate ids and makes no call without ids', async () => {
    apiFetchMock.mockResolvedValueOnce(summariesFor(['p1']));

    await socialApi.getLikesSummary(['p1', 'p1']);
    expect(apiFetchMock).toHaveBeenCalledTimes(1);

    expect(await socialApi.getLikesSummary([])).toEqual([]);
    expect(apiFetchMock).toHaveBeenCalledTimes(1);
  });
});
