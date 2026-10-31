import { apiFetch } from '../client';
import { SOCIAL_ENDPOINTS, type SetEventAttendanceWebRequest } from '../endpoints/social.endpoints';
import type {
  ActionSuccessWebResponse,
  ListUsersWebResponse,
  GetIsFollowingWebResponse,
  GetMyFollowsWebResponse,
  GetMyFollowersWebResponse,
  GetEventAttendeesResponse,
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

  /**
   * Valide ou révoque l'émargement des participants à un événement.
   */
  async setEventAttendance(
    eventId: string,
    payload: { checkedUserIds: string[]; uncheckedUserIds?: string[] },
  ): Promise<ActionSuccessWebResponse> {
    const rawPath = SOCIAL_ENDPOINTS.SET_EVENT_ATTENDANCE.path.replace(':eventId', eventId);
    return await apiFetch<ActionSuccessWebResponse, SetEventAttendanceWebRequest>(rawPath, {
      method: SOCIAL_ENDPOINTS.SET_EVENT_ATTENDANCE.method,
      requiresAuth: SOCIAL_ENDPOINTS.SET_EVENT_ATTENDANCE.requiresAuth,
      body: payload,
    });
  },

  /**
   * Récupère la liste des inscrits avec leur statut d'émargement (checkedInAt).
   */
  async getEventAttendees(
    eventId: string,
    params?: { page?: number; limit?: number },
  ): Promise<GetEventAttendeesResponse> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.limit !== undefined) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const rawPath = SOCIAL_ENDPOINTS.GET_EVENT_ATTENDEES.path.replace(':eventId', eventId);
    const path = queryString ? `${rawPath}?${queryString}` : rawPath;

    return await apiFetch<GetEventAttendeesResponse>(path, {
      method: SOCIAL_ENDPOINTS.GET_EVENT_ATTENDEES.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_EVENT_ATTENDEES.requiresAuth,
    });
  },

  /**
   * Ajoute un like sur un post pour l'utilisateur connecté.
   */
  async likePost(postId: string): Promise<ActionSuccessWebResponse> {
    return await apiFetch<ActionSuccessWebResponse>(
      SOCIAL_ENDPOINTS.LIKE_POST_SELF.path.replace(':postId', postId),
      {
        method: SOCIAL_ENDPOINTS.LIKE_POST_SELF.method,
        requiresAuth: SOCIAL_ENDPOINTS.LIKE_POST_SELF.requiresAuth,
      },
    );
  },

  /**
   * Retire le like d'un post pour l'utilisateur connecté.
   */
  async unlikePost(postId: string): Promise<ActionSuccessWebResponse> {
    return await apiFetch<ActionSuccessWebResponse>(
      SOCIAL_ENDPOINTS.UNLIKE_POST_SELF.path.replace(':postId', postId),
      {
        method: SOCIAL_ENDPOINTS.UNLIKE_POST_SELF.method,
        requiresAuth: SOCIAL_ENDPOINTS.UNLIKE_POST_SELF.requiresAuth,
      },
    );
  },

  /**
   * Récupère la liste des IDs des posts likés par l'utilisateur connecté.
   */
  async getMyLikes(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ ids: string[]; totalCount: number }> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 500;
    const query = new URLSearchParams();
    query.append('page', page.toString());
    query.append('limit', limit.toString());
    query.append('pagination[page]', page.toString());
    query.append('pagination[limit]', limit.toString());

    const queryString = query.toString();
    const path = `${SOCIAL_ENDPOINTS.GET_USER_LIKES_SELF.path}?${queryString}`;

    const response = await apiFetch<{
      ids: string[];
      totalCount?: number;
      pagination?: { totalCount?: number; total?: number };
    }>(path, {
      method: SOCIAL_ENDPOINTS.GET_USER_LIKES_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_LIKES_SELF.requiresAuth,
    });

    return {
      ids: response.ids,
      totalCount:
        response.totalCount ??
        response.pagination?.totalCount ??
        response.pagination?.total ??
        response.ids.length,
    };
  },

  /**
   * Fait suivre un utilisateur par l'utilisateur connecté.
   */
  async followUser(followedId: string): Promise<ActionSuccessWebResponse> {
    return await apiFetch<ActionSuccessWebResponse>(
      SOCIAL_ENDPOINTS.FOLLOW_SELF.path.replace(':followedId', followedId),
      {
        method: SOCIAL_ENDPOINTS.FOLLOW_SELF.method,
        requiresAuth: SOCIAL_ENDPOINTS.FOLLOW_SELF.requiresAuth,
      },
    );
  },

  /**
   * Retire le suivi d'un utilisateur pour l'utilisateur connecté.
   */
  async unfollowUser(followedId: string): Promise<ActionSuccessWebResponse> {
    return await apiFetch<ActionSuccessWebResponse>(
      SOCIAL_ENDPOINTS.UNFOLLOW_SELF.path.replace(':followedId', followedId),
      {
        method: SOCIAL_ENDPOINTS.UNFOLLOW_SELF.method,
        requiresAuth: SOCIAL_ENDPOINTS.UNFOLLOW_SELF.requiresAuth,
      },
    );
  },

  /**
   * Récupère la liste des utilisateurs suivis par l'utilisateur connecté.
   */
  async getMyFollows(params?: { page?: number; limit?: number }): Promise<ListUsersWebResponse> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append('pagination[page]', params.page.toString());
    if (params?.limit !== undefined) query.append('pagination[limit]', params.limit.toString());

    const queryString = query.toString();
    const path = queryString
      ? `${SOCIAL_ENDPOINTS.GET_FOLLOWS_SELF.path}?${queryString}`
      : SOCIAL_ENDPOINTS.GET_FOLLOWS_SELF.path;

    return await apiFetch<ListUsersWebResponse>(path, {
      method: SOCIAL_ENDPOINTS.GET_FOLLOWS_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_FOLLOWS_SELF.requiresAuth,
    });
  },

  /**
   * Récupère la liste des utilisateurs suivis par un utilisateur donné.
   */
  async getFollows(
    userId: string,
    params?: { page?: number; limit?: number },
  ): Promise<GetMyFollowsWebResponse> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append('pagination[page]', params.page.toString());
    if (params?.limit !== undefined) query.append('pagination[limit]', params.limit.toString());

    const queryString = query.toString();
    const endpointPath = SOCIAL_ENDPOINTS.GET_FOLLOWS.path.replace(':userId', userId);
    const path = queryString ? `${endpointPath}?${queryString}` : endpointPath;

    return await apiFetch<GetMyFollowsWebResponse>(path, {
      method: SOCIAL_ENDPOINTS.GET_FOLLOWS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_FOLLOWS.requiresAuth,
    });
  },

  /**
   * Récupère la liste des abonnés d'un utilisateur donné.
   */
  async getFollowers(
    userId: string,
    params?: { page?: number; limit?: number },
  ): Promise<GetMyFollowersWebResponse> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append('pagination[page]', params.page.toString());
    if (params?.limit !== undefined) query.append('pagination[limit]', params.limit.toString());

    const queryString = query.toString();
    const endpointPath = SOCIAL_ENDPOINTS.GET_FOLLOWERS.path.replace(':userId', userId);
    const path = queryString ? `${endpointPath}?${queryString}` : endpointPath;

    return await apiFetch<GetMyFollowersWebResponse>(path, {
      method: SOCIAL_ENDPOINTS.GET_FOLLOWERS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_FOLLOWERS.requiresAuth,
    });
  },

  /**
   * Vérifie si l'utilisateur courant suit un autre utilisateur
   */
  async getIsFollowing(userId: string): Promise<GetIsFollowingWebResponse> {
    return await apiFetch<GetIsFollowingWebResponse>(
      SOCIAL_ENDPOINTS.GET_IS_FOLLOWING.path.replace(':userId', userId),
      {
        method: SOCIAL_ENDPOINTS.GET_IS_FOLLOWING.method,
        requiresAuth: SOCIAL_ENDPOINTS.GET_IS_FOLLOWING.requiresAuth,
      },
    );
  },
};
