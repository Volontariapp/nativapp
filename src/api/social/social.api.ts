import { apiFetch } from '../client';
import { SOCIAL_ENDPOINTS } from '../endpoints/social.endpoints';
import type { IdsListWebResponse } from '@volontariapp/contracts';

/**
 * Service API pour les interactions sociales (participations, likes, follows, etc.)
 */
export const socialApi = {
  /**
   * Récupère la liste des IDs d'événements auxquels l'utilisateur connecté participe.
   */
  async getMyParticipations(): Promise<string[]> {
    const response = await apiFetch<IdsListWebResponse>(
      SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.path,
      {
        method: SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.method,
        requiresAuth: SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.requiresAuth,
      },
    );

    return response.ids;
  },
};
