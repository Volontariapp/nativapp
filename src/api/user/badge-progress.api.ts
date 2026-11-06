import type { BadgeProgressWeb, GetMyBadgeProgressWebResponse } from '@volontariapp/contracts';
import { apiFetch } from '../client';
import { USER_ENDPOINTS } from '../endpoints';

export const badgeProgressApi = {
  /** Une entree par badge du catalogue : points, etat debloque et avancement de chaque exigence. */
  async getMyBadgeProgress(): Promise<BadgeProgressWeb[]> {
    const endpoint = USER_ENDPOINTS.GET_MY_BADGE_PROGRESS;
    try {
      const response = await apiFetch<GetMyBadgeProgressWebResponse>(endpoint.path, {
        method: endpoint.method,
        requiresAuth: endpoint.requiresAuth,
      });
      return response.badges;
    } catch (error) {
      console.error(
        '[badgeProgressApi.getMyBadgeProgress] Error details:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },
};
