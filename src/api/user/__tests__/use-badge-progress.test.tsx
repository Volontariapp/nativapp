import { renderHook, waitFor } from '@testing-library/react-native';
import { createQueryWrapper, createTestQueryClient } from '@/api/__tests__/query-wrapper.factory';
import { createBadgeProgress } from '@/components/dataDisplay/badge/__tests__/badge-progress.factory';
import { BADGE_PROGRESS_QUERY_KEY, useBadgeProgress } from '../hooks/use-badge-progress';

const mockGetMyBadgeProgress = jest.fn();

jest.mock('../badge-progress.api', () => ({
  badgeProgressApi: { getMyBadgeProgress: (): unknown => mockGetMyBadgeProgress() },
}));

describe('useBadgeProgress', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('loads the progress and caches it under its own key', async () => {
    const badges = [createBadgeProgress()];
    mockGetMyBadgeProgress.mockResolvedValue(badges);
    const client = createTestQueryClient();

    const { result } = renderHook(() => useBadgeProgress(), { wrapper: createQueryWrapper(client) });

    await waitFor(() => {
      expect(result.current.data).toEqual(badges);
    });
    expect(client.getQueryData(BADGE_PROGRESS_QUERY_KEY)).toEqual(badges);
  });

  it('reports the failure instead of throwing', async () => {
    mockGetMyBadgeProgress.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useBadgeProgress(), { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
