import { apiFetch } from '../client';
import { SOCIAL_ENDPOINTS } from '../endpoints/social.endpoints';
import type {
  ActionSuccessWebResponse,
  GetUserParticipateEventWebResponse,
  GetUserWishEventWebResponse,
} from '@volontariapp/contracts';

/**
 * Service API pour les interactions sociales (participations, likes, follows, etc.)
 */
export const socialApi = {
  /**
   * Récupère la liste des IDs d'événements auxquels l'utilisateur connecté participe.
   */
  async getMyParticipations(): Promise<string[]> {
    const response = await apiFetch<GetUserParticipateEventWebResponse>(
      SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.path,
      {
        method: SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.method,
        requiresAuth: SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.requiresAuth,
      },
    );

    return response.ids;
  },

  /**
   * Ajoute l'utilisateur connecté comme participant à un événement.
   */
  async participate(eventId: string): Promise<ActionSuccessWebResponse> {
    return await apiFetch<ActionSuccessWebResponse>(
      SOCIAL_ENDPOINTS.PARTICIPATE_SELF.path.replace(':eventId', eventId),
      {
        method: SOCIAL_ENDPOINTS.PARTICIPATE_SELF.method,
        requiresAuth: SOCIAL_ENDPOINTS.PARTICIPATE_SELF.requiresAuth,
      },
    );
  },

  /**
   * Retire l'utilisateur connecté des participants d'un événement.
   */
  async unparticipate(eventId: string): Promise<ActionSuccessWebResponse> {
    return await apiFetch<ActionSuccessWebResponse>(
      SOCIAL_ENDPOINTS.UNPARTICIPATE_SELF.path.replace(':eventId', eventId),
      {
        method: SOCIAL_ENDPOINTS.UNPARTICIPATE_SELF.method,
        requiresAuth: SOCIAL_ENDPOINTS.UNPARTICIPATE_SELF.requiresAuth,
      },
    );
  },

  /**
   * Récupère la liste des IDs d'événements dans les souhaits de l'utilisateur connecté.
   */
  async getMyWishes(): Promise<string[]> {
    const response = await apiFetch<GetUserWishEventWebResponse>(
      SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.path,
      {
        method: SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.method,
        requiresAuth: SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.requiresAuth,
      },
    );

    return response.ids;
  },

  /**
   * Ajoute un événement aux souhaits de l'utilisateur connecté.
   */
  async wishEvent(eventId: string): Promise<ActionSuccessWebResponse> {
    return await apiFetch<ActionSuccessWebResponse>(
      SOCIAL_ENDPOINTS.WISH_EVENT_SELF.path.replace(':eventId', eventId),
      {
        method: SOCIAL_ENDPOINTS.WISH_EVENT_SELF.method,
        requiresAuth: SOCIAL_ENDPOINTS.WISH_EVENT_SELF.requiresAuth,
      },
    );
  },

  /**
   * Retire un événement des souhaits de l'utilisateur connecté.
   */
  async unwishEvent(eventId: string): Promise<ActionSuccessWebResponse> {
    return await apiFetch<ActionSuccessWebResponse>(
      SOCIAL_ENDPOINTS.UNWISH_EVENT_SELF.path.replace(':eventId', eventId),
      {
        method: SOCIAL_ENDPOINTS.UNWISH_EVENT_SELF.method,
        requiresAuth: SOCIAL_ENDPOINTS.UNWISH_EVENT_SELF.requiresAuth,
      },
    );
  },
};
