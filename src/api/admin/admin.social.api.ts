import { apiFetch } from '../client';
import { SOCIAL_ENDPOINTS } from '../endpoints/social.endpoints';
import type { ActionSuccessWebResponse } from '@volontariapp/contracts';

export const adminSocialApi = {
  async participate(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.PARTICIPATE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.PARTICIPATE.method,
      requiresAuth: SOCIAL_ENDPOINTS.PARTICIPATE.requiresAuth,
    });
  },
};
