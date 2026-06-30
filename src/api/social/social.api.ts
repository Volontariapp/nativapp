import { apiFetch } from '../client';
import { SOCIAL_ENDPOINTS } from '../endpoints/social.endpoints';
import type {
  ActionSuccessWebResponse,
} from '@volontariapp/contracts';

/**
 * Service API pour les interactions sociales (participations, likes, follows, etc.)
 */
export const socialApi = {
  /**
   * Récupère la liste des IDs d'événements auxquels l'utilisateur connecté participe.
   */
  async getMyParticipations(params: {
    page?: number;
    limit?: number;
  }): Promise<{ ids: string[]; totalCount: number }> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const path = queryString
      ? `${SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.path}?${queryString}`
      : SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.path;

    const response = await apiFetch<{ ids: string[]; totalCount: number }>(path, {
      method: SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.requiresAuth,
    });

    return {
      ids: response.ids,
      totalCount: response.totalCount,
    };
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
  async getMyWishes(params: {
    page?: number;
    limit?: number;
  }): Promise<{ ids: string[]; totalCount: number }> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const path = queryString
      ? `${SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.path}?${queryString}`
      : SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.path;

    const response = await apiFetch<{ ids: string[]; totalCount: number }>(path, {
      method: SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.requiresAuth,
    });

    return {
      ids: response.ids,
      totalCount: response.totalCount,
    };
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

  /**
   * Récupère la liste des participants d'un événement.
   */
  async getEventParticipants(
    eventId: string,
    params: {
      page?: number;
      limit?: number;
    },
  ): Promise<{ ids: string[]; totalCount: number }> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const rawPath = SOCIAL_ENDPOINTS.GET_EVENT_PARTICIPANTS.path.replace(':eventId', eventId);
    const path = queryString ? `${rawPath}?${queryString}` : rawPath;

    const response = await apiFetch<{ ids: string[]; totalCount: number }>(path, {
      method: SOCIAL_ENDPOINTS.GET_EVENT_PARTICIPANTS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_EVENT_PARTICIPANTS.requiresAuth,
    });

    return response;
  },
};
