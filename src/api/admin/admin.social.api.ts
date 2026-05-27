import { apiFetch } from '../client';
import { SOCIAL_ENDPOINTS } from '../endpoints/social.endpoints';
import type {
  ActionSuccessWebResponse,
  GetEventPostsWebRequest,
  GetUserLikesWebRequest,
  GetEventParticipantsWebRequest,
  GetUserPostsWebRequest,
  GetFeedWebRequest,
  GetMyFollowsWebRequest,
  GetMyFollowersWebRequest,
  GetMyBlocksWebRequest,
  GetWhoBlockedMeWebRequest,
  ListUsersWebResponse,
} from '@volontariapp/contracts';
import type {
  EventIdWebResponse,
  IdsListWebResponse,
  GetUserEventsRequest,
  GetUserParticipationsRequest,
  GetUserWishesRequest,
  ExistsWebResponse,
} from '../endpoints/types/missing-types';

export const adminSocialApi = {
  async linkPostToEvent(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.LINK_POST_TO_EVENT.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.LINK_POST_TO_EVENT.method,
      requiresAuth: SOCIAL_ENDPOINTS.LINK_POST_TO_EVENT.requiresAuth,
    });
  },

  async unlinkPostFromEvent(
    pathParams?: Record<string, string>,
  ): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.UNLINK_POST_FROM_EVENT.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.UNLINK_POST_FROM_EVENT.method,
      requiresAuth: SOCIAL_ENDPOINTS.UNLINK_POST_FROM_EVENT.requiresAuth,
    });
  },

  async getEventRelatedToPost(pathParams?: Record<string, string>): Promise<EventIdWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_EVENT_RELATED_TO_POST.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<EventIdWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_EVENT_RELATED_TO_POST.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_EVENT_RELATED_TO_POST.requiresAuth,
    });
  },

  async getEventPosts(
    payload: GetEventPostsWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_EVENT_POSTS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetEventPostsWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_EVENT_POSTS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_EVENT_POSTS.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_EVENT_POSTS.method !== 'GET' ? payload : undefined,
    });
  },

  async likePost(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.LIKE_POST.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.LIKE_POST.method,
      requiresAuth: SOCIAL_ENDPOINTS.LIKE_POST.requiresAuth,
    });
  },

  async unlikePost(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.UNLIKE_POST.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.UNLIKE_POST.method,
      requiresAuth: SOCIAL_ENDPOINTS.UNLIKE_POST.requiresAuth,
    });
  },

  async likePostSelf(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.LIKE_POST_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.LIKE_POST_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.LIKE_POST_SELF.requiresAuth,
    });
  },

  async unlikePostSelf(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.UNLIKE_POST_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.UNLIKE_POST_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.UNLIKE_POST_SELF.requiresAuth,
    });
  },

  async createEventNode(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.CREATE_EVENT_NODE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.CREATE_EVENT_NODE.method,
      requiresAuth: SOCIAL_ENDPOINTS.CREATE_EVENT_NODE.requiresAuth,
    });
  },

  async deleteEventNode(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.DELETE_EVENT_NODE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.DELETE_EVENT_NODE.method,
      requiresAuth: SOCIAL_ENDPOINTS.DELETE_EVENT_NODE.requiresAuth,
    });
  },

  async ownEvent(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.OWN_EVENT.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.OWN_EVENT.method,
      requiresAuth: SOCIAL_ENDPOINTS.OWN_EVENT.requiresAuth,
    });
  },

  async disownEvent(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.DISOWN_EVENT.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.DISOWN_EVENT.method,
      requiresAuth: SOCIAL_ENDPOINTS.DISOWN_EVENT.requiresAuth,
    });
  },

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

  async participateSelf(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.PARTICIPATE_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.PARTICIPATE_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.PARTICIPATE_SELF.requiresAuth,
    });
  },

  async unparticipateSelf(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.UNPARTICIPATE_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.UNPARTICIPATE_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.UNPARTICIPATE_SELF.requiresAuth,
    });
  },

  async wishEventSelf(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.WISH_EVENT_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.WISH_EVENT_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.WISH_EVENT_SELF.requiresAuth,
    });
  },

  async unwishEventSelf(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.UNWISH_EVENT_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.UNWISH_EVENT_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.UNWISH_EVENT_SELF.requiresAuth,
    });
  },

  async createPostNode(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.CREATE_POST_NODE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.CREATE_POST_NODE.method,
      requiresAuth: SOCIAL_ENDPOINTS.CREATE_POST_NODE.requiresAuth,
    });
  },

  async deletePostNode(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.DELETE_POST_NODE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.DELETE_POST_NODE.method,
      requiresAuth: SOCIAL_ENDPOINTS.DELETE_POST_NODE.requiresAuth,
    });
  },

  async ownPost(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.OWN_POST.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.OWN_POST.method,
      requiresAuth: SOCIAL_ENDPOINTS.OWN_POST.requiresAuth,
    });
  },

  async disownPost(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.DISOWN_POST.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.DISOWN_POST.method,
      requiresAuth: SOCIAL_ENDPOINTS.DISOWN_POST.requiresAuth,
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

  async followSelf(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.FOLLOW_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.FOLLOW_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.FOLLOW_SELF.requiresAuth,
    });
  },

  async unfollowSelf(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.UNFOLLOW_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.UNFOLLOW_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.UNFOLLOW_SELF.requiresAuth,
    });
  },

  async blockSelf(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.BLOCK_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.BLOCK_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.BLOCK_SELF.requiresAuth,
    });
  },

  async unblockSelf(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.UNBLOCK_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.UNBLOCK_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.UNBLOCK_SELF.requiresAuth,
    });
  },

  async createUserNode(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.CREATE_USER_NODE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.CREATE_USER_NODE.method,
      requiresAuth: SOCIAL_ENDPOINTS.CREATE_USER_NODE.requiresAuth,
    });
  },

  async deleteUserNode(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.DELETE_USER_NODE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.DELETE_USER_NODE.method,
      requiresAuth: SOCIAL_ENDPOINTS.DELETE_USER_NODE.requiresAuth,
    });
  },

  async getUserLikes(
    payload: GetUserLikesWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_USER_LIKES.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetUserLikesWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_USER_LIKES.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_LIKES.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_USER_LIKES.method !== 'GET' ? payload : undefined,
    });
  },

  async getUserLikesSelf(
    payload: GetUserLikesWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_USER_LIKES_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetUserLikesWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_USER_LIKES_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_LIKES_SELF.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_USER_LIKES_SELF.method !== 'GET' ? payload : undefined,
    });
  },

  async getPostLikers(
    payload: GetUserLikesWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_POST_LIKERS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetUserLikesWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_POST_LIKERS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_POST_LIKERS.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_POST_LIKERS.method !== 'GET' ? payload : undefined,
    });
  },

  async getUserCreatedEvents(
    payload: GetUserEventsRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_USER_CREATED_EVENTS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetUserEventsRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_USER_CREATED_EVENTS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_CREATED_EVENTS.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_USER_CREATED_EVENTS.method !== 'GET' ? payload : undefined,
    });
  },

  async getUserParticipatedEvents(
    payload: GetUserParticipationsRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetUserParticipationsRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS.method !== 'GET' ? payload : undefined,
    });
  },

  async getUserWishedEvents(
    payload: GetUserWishesRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetUserWishesRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS.method !== 'GET' ? payload : undefined,
    });
  },

  async getUserCreatedEventsSelf(
    payload: GetUserEventsRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_USER_CREATED_EVENTS_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetUserEventsRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_USER_CREATED_EVENTS_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_CREATED_EVENTS_SELF.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_USER_CREATED_EVENTS_SELF.method !== 'GET' ? payload : undefined,
    });
  },

  async getUserParticipatedEventsSelf(
    payload: GetUserParticipationsRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetUserParticipationsRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.requiresAuth,
      body:
        SOCIAL_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.method !== 'GET' ? payload : undefined,
    });
  },

  async getUserWishedEventsSelf(
    payload: GetUserWishesRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetUserWishesRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.method !== 'GET' ? payload : undefined,
    });
  },

  async getEventNode(pathParams?: Record<string, string>): Promise<ExistsWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_EVENT_NODE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ExistsWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_EVENT_NODE.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_EVENT_NODE.requiresAuth,
    });
  },

  async getEventParticipants(
    payload: GetEventParticipantsWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_EVENT_PARTICIPANTS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetEventParticipantsWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_EVENT_PARTICIPANTS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_EVENT_PARTICIPANTS.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_EVENT_PARTICIPANTS.method !== 'GET' ? payload : undefined,
    });
  },

  async getUserPosts(
    payload: GetUserPostsWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_USER_POSTS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetUserPostsWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_USER_POSTS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_POSTS.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_USER_POSTS.method !== 'GET' ? payload : undefined,
    });
  },

  async getFeed(
    payload: GetFeedWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_FEED.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetFeedWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_FEED.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_FEED.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_FEED.method !== 'GET' ? payload : undefined,
    });
  },

  async getUserPostsSelf(
    payload: GetUserPostsWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_USER_POSTS_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetUserPostsWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_USER_POSTS_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_POSTS_SELF.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_USER_POSTS_SELF.method !== 'GET' ? payload : undefined,
    });
  },

  async getFeedSelf(
    payload: GetFeedWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_FEED_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetFeedWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_FEED_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_FEED_SELF.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_FEED_SELF.method !== 'GET' ? payload : undefined,
    });
  },

  async getPostNode(pathParams?: Record<string, string>): Promise<ExistsWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_POST_NODE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ExistsWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_POST_NODE.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_POST_NODE.requiresAuth,
    });
  },

  async getFollows(
    payload: GetMyFollowsWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_FOLLOWS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetMyFollowsWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_FOLLOWS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_FOLLOWS.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_FOLLOWS.method !== 'GET' ? payload : undefined,
    });
  },

  async getFollowers(
    payload: GetMyFollowersWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_FOLLOWERS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetMyFollowersWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_FOLLOWERS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_FOLLOWERS.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_FOLLOWERS.method !== 'GET' ? payload : undefined,
    });
  },

  async getBlocks(
    payload: GetMyBlocksWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_BLOCKS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetMyBlocksWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_BLOCKS.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_BLOCKS.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_BLOCKS.method !== 'GET' ? payload : undefined,
    });
  },

  async getWhoBlockedMe(
    payload: GetWhoBlockedMeWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_WHO_BLOCKED_ME.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetWhoBlockedMeWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_WHO_BLOCKED_ME.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_WHO_BLOCKED_ME.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_WHO_BLOCKED_ME.method !== 'GET' ? payload : undefined,
    });
  },

  async getFollowsSelf(
    payload: GetMyFollowsWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<ListUsersWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_FOLLOWS_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ListUsersWebResponse, GetMyFollowsWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_FOLLOWS_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_FOLLOWS_SELF.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_FOLLOWS_SELF.method !== 'GET' ? payload : undefined,
    });
  },

  async getFollowersSelf(
    payload: GetMyFollowersWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<ListUsersWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_FOLLOWERS_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ListUsersWebResponse, GetMyFollowersWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_FOLLOWERS_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_FOLLOWERS_SELF.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_FOLLOWERS_SELF.method !== 'GET' ? payload : undefined,
    });
  },

  async getBlocksSelf(
    payload: GetMyBlocksWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_BLOCKS_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetMyBlocksWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_BLOCKS_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_BLOCKS_SELF.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_BLOCKS_SELF.method !== 'GET' ? payload : undefined,
    });
  },

  async getWhoBlockedMeSelf(
    payload: GetWhoBlockedMeWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<IdsListWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_WHO_BLOCKED_ME_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<IdsListWebResponse, GetWhoBlockedMeWebRequest>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_WHO_BLOCKED_ME_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_WHO_BLOCKED_ME_SELF.requiresAuth,
      body: SOCIAL_ENDPOINTS.GET_WHO_BLOCKED_ME_SELF.method !== 'GET' ? payload : undefined,
    });
  },

  async getUserNode(pathParams?: Record<string, string>): Promise<ExistsWebResponse> {
    let finalPath: string = SOCIAL_ENDPOINTS.GET_USER_NODE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ExistsWebResponse>(finalPath, {
      method: SOCIAL_ENDPOINTS.GET_USER_NODE.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_NODE.requiresAuth,
    });
  },
};
