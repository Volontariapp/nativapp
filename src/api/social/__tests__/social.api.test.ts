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
