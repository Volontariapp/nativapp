import { apiFetch } from '../client';
import { HEALTH_ENDPOINTS } from '../endpoints/health.endpoints';

export const adminHealthApi = {
  async checkHealth(pathParams?: Record<string, string>): Promise<void> {
    let finalPath: string = HEALTH_ENDPOINTS.CHECK_HEALTH.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch(finalPath, {
      method: HEALTH_ENDPOINTS.CHECK_HEALTH.method,
      requiresAuth: HEALTH_ENDPOINTS.CHECK_HEALTH.requiresAuth,
    });
  },
};
