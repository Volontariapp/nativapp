import { apiFetch } from '../client';
import { LIVE_ENDPOINTS } from '../endpoints/live.endpoints';
import type { LiveSharingClientStopReason } from './live.types';

// Aucun journal ici : ces appels accompagnent un partage de position (vie privee).
export const liveApi = {
  async startSharing(eventId: string): Promise<void> {
    const endpoint = LIVE_ENDPOINTS.START_SHARING;
    await apiFetch<undefined>(endpoint.path.replace(':eventId', encodeURIComponent(eventId)), {
      method: endpoint.method,
      requiresAuth: endpoint.requiresAuth,
    });
  },

  async stopSharing(eventId: string, reason: LiveSharingClientStopReason): Promise<void> {
    const endpoint = LIVE_ENDPOINTS.STOP_SHARING;
    await apiFetch<undefined>(endpoint.path.replace(':eventId', encodeURIComponent(eventId)), {
      method: endpoint.method,
      requiresAuth: endpoint.requiresAuth,
      params: { reason },
    });
  },
};
