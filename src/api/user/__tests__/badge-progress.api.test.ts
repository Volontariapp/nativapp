import type { BadgeProgressWeb } from '@volontariapp/contracts';
import { apiFetch } from '../../client';
import { badgeProgressApi } from '../badge-progress.api';
import { createBadgeProgress } from '@/components/dataDisplay/badge/__tests__/badge-progress.factory';

jest.mock('../../client', () => ({ apiFetch: jest.fn() }));

const apiFetchMock = jest.mocked(apiFetch);

describe('badgeProgressApi.getMyBadgeProgress', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('reads the progress of the connected user from the dedicated route', async () => {
    const badges: BadgeProgressWeb[] = [createBadgeProgress()];
    apiFetchMock.mockResolvedValue({ badges });

    const result = await badgeProgressApi.getMyBadgeProgress();

    expect(result).toEqual(badges);
    expect(apiFetchMock).toHaveBeenCalledWith('/users/me/badges/progress', {
      method: 'GET',
      requiresAuth: true,
    });
  });

  it('lets the error through so the caller can react to it', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    apiFetchMock.mockRejectedValue(new Error('network down'));

    await expect(badgeProgressApi.getMyBadgeProgress()).rejects.toThrow('network down');
  });
});
