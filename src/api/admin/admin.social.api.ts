import { apiFetch } from '../client';
import { SOCIAL_ENDPOINTS } from '../endpoints/social.endpoints';
import type {
  ActionSuccessWebResponse,
  GetMyFollowsWebRequest,
  GetMyFollowersWebRequest,
  GetMyBlocksWebRequest,
  GetUserPostsWebRequest,
  GetUserEventWebResponse,
  GetUserParticipateEventWebResponse,
  GetUserWishEventWebResponse,
  GetUserParticipateEventWebRequest,
  GetUserWishEventWebRequest,
} from '@volontariapp/contracts';

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
  async unparticipate(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.UNPARTICIPATE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.UNPARTICIPATE.method,
      requiresAuth: SOCIAL_ENDPOINTS.UNPARTICIPATE.requiresAuth,
    });
  },

  async wishEvent(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.WISH_EVENT.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.WISH_EVENT.method,
      requiresAuth: SOCIAL_ENDPOINTS.WISH_EVENT.requiresAuth,
    });
  },

  async unwishEvent(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.UNWISH_EVENT.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.UNWISH_EVENT.method,
      requiresAuth: SOCIAL_ENDPOINTS.UNWISH_EVENT.requiresAuth,
    });
  },

  async follow(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.FOLLOW.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.FOLLOW.method,
      requiresAuth: SOCIAL_ENDPOINTS.FOLLOW.requiresAuth,
    });
  },

  async unfollow(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.UNFOLLOW.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.UNFOLLOW.method,
      requiresAuth: SOCIAL_ENDPOINTS.UNFOLLOW.requiresAuth,
    });
  },

  async block(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.BLOCK.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.BLOCK.method,
      requiresAuth: SOCIAL_ENDPOINTS.BLOCK.requiresAuth,
    });
  },

  async unblock(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.UNBLOCK.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.UNBLOCK.method,
      requiresAuth: SOCIAL_ENDPOINTS.UNBLOCK.requiresAuth,
    });
  },

  async getUserParticipatedEvents(
    payload: GetUserParticipateEventWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<GetUserParticipateEventWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<GetUserParticipateEventWebResponse, GetUserParticipateEventWebRequest>(
      finalPath,
      {
        method: SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS.method,
        requiresAuth: SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS.requiresAuth,
      },
    );
  },

  async getUserWishedEvents(
    payload: GetUserWishEventWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<GetUserWishEventWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<GetUserWishEventWebResponse, GetUserWishEventWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS.requiresAuth,
    });
  },

  async getFollowers(
    payload: GetMyFollowersWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<GetUserEventWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_FOLLOWERS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<GetUserEventWebResponse, GetMyFollowersWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_FOLLOWERS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_FOLLOWERS.requiresAuth,
    });
  },

  async getFollows(
    payload: GetMyFollowsWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<GetUserEventWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_FOLLOWS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<GetUserEventWebResponse, GetMyFollowsWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_FOLLOWS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_FOLLOWS.requiresAuth,
    });
  },

  async getBlocks(
    payload: GetMyBlocksWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<GetUserEventWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_BLOCKS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<GetUserEventWebResponse, GetMyBlocksWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_BLOCKS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_BLOCKS.requiresAuth,
    });
  },

  async getUserPosts(
    payload: GetUserPostsWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<GetUserEventWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_USER_POSTS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<GetUserEventWebResponse, GetUserPostsWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_USER_POSTS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_POSTS.requiresAuth,
    });
  },
};
