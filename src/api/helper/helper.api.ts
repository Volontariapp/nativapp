import { apiFetch } from '../client';
import { HELPER_ENDPOINTS } from '../endpoints/helper.endpoints';

export const helperApi = {
  async generateAccessToken(userId: string, role: string): Promise<{ token: string }> {
    const response = await apiFetch<{ token: string }>(
      `${HELPER_ENDPOINTS.GENERATE_ACCESS_TOKEN.path}?userId=${userId}&role=${role}`,
      {
        method: HELPER_ENDPOINTS.GENERATE_ACCESS_TOKEN.method,
        requiresAuth: HELPER_ENDPOINTS.GENERATE_ACCESS_TOKEN.requiresAuth,
      },
    );

    return response;
  },
};
