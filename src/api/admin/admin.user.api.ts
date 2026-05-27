import { apiFetch } from '../client';
import { USER_ENDPOINTS } from '../endpoints/user.endpoints';
import type {
  SignUpRequest,
  SignUpWebResponse,
  LoginRequest,
  LoginWebResponse,
  RefreshTokenRequest,
  CreateBadgeRequest,
  BadgeWebResponse,
  UpdateBadgeRequest,
  UpdateUserRequest,
  UserWebResponse,
  AddBadgeToUserRequest,
  IncrementImpactScoreRequest,
  ActionSuccessWebResponse,
  ListBadgesRequest,
  ListBadgesWebResponse,
  ListUsersRequest,
  ListUsersWebResponse,
  GetEventParticipantsWebRequest,
  GetPostLikersWebRequest,
} from '@volontariapp/contracts';

export const adminUserApi = {
  async signUp(
    payload: SignUpRequest,
    pathParams?: Record<string, string>,
  ): Promise<SignUpWebResponse> {
    let finalPath: string = USER_ENDPOINTS.SIGN_UP.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<SignUpWebResponse, SignUpRequest>(finalPath, {
      method: USER_ENDPOINTS.SIGN_UP.method,
      requiresAuth: USER_ENDPOINTS.SIGN_UP.requiresAuth,
      body: USER_ENDPOINTS.SIGN_UP.method !== 'GET' ? payload : undefined,
    });
  },

  async login(
    payload: LoginRequest,
    pathParams?: Record<string, string>,
  ): Promise<LoginWebResponse> {
    let finalPath: string = USER_ENDPOINTS.LOGIN.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<LoginWebResponse, LoginRequest>(finalPath, {
      method: USER_ENDPOINTS.LOGIN.method,
      requiresAuth: USER_ENDPOINTS.LOGIN.requiresAuth,
      body: USER_ENDPOINTS.LOGIN.method !== 'GET' ? payload : undefined,
    });
  },

  async refreshToken(
    payload: RefreshTokenRequest,
    pathParams?: Record<string, string>,
  ): Promise<LoginWebResponse> {
    let finalPath: string = USER_ENDPOINTS.REFRESH_TOKEN.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<LoginWebResponse, RefreshTokenRequest>(finalPath, {
      method: USER_ENDPOINTS.REFRESH_TOKEN.method,
      requiresAuth: USER_ENDPOINTS.REFRESH_TOKEN.requiresAuth,
      body: USER_ENDPOINTS.REFRESH_TOKEN.method !== 'GET' ? payload : undefined,
    });
  },

  async createBadge(
    payload: CreateBadgeRequest,
    pathParams?: Record<string, string>,
  ): Promise<BadgeWebResponse> {
    let finalPath: string = USER_ENDPOINTS.CREATE_BADGE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<BadgeWebResponse, CreateBadgeRequest>(finalPath, {
      method: USER_ENDPOINTS.CREATE_BADGE.method,
      requiresAuth: USER_ENDPOINTS.CREATE_BADGE.requiresAuth,
      body: USER_ENDPOINTS.CREATE_BADGE.method !== 'GET' ? payload : undefined,
    });
  },

  async updateBadge(
    payload: UpdateBadgeRequest,
    pathParams?: Record<string, string>,
  ): Promise<BadgeWebResponse> {
    let finalPath: string = USER_ENDPOINTS.UPDATE_BADGE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<BadgeWebResponse, UpdateBadgeRequest>(finalPath, {
      method: USER_ENDPOINTS.UPDATE_BADGE.method,
      requiresAuth: USER_ENDPOINTS.UPDATE_BADGE.requiresAuth,
      body: USER_ENDPOINTS.UPDATE_BADGE.method !== 'GET' ? payload : undefined,
    });
  },

  async deleteBadge(pathParams?: Record<string, string>): Promise<void> {
    let finalPath: string = USER_ENDPOINTS.DELETE_BADGE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch(finalPath, {
      method: USER_ENDPOINTS.DELETE_BADGE.method,
      requiresAuth: USER_ENDPOINTS.DELETE_BADGE.requiresAuth,
    });
  },

  async updateUser(
    payload: UpdateUserRequest,
    pathParams?: Record<string, string>,
  ): Promise<UserWebResponse> {
    let finalPath: string = USER_ENDPOINTS.UPDATE_USER.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<UserWebResponse, UpdateUserRequest>(finalPath, {
      method: USER_ENDPOINTS.UPDATE_USER.method,
      requiresAuth: USER_ENDPOINTS.UPDATE_USER.requiresAuth,
      body: USER_ENDPOINTS.UPDATE_USER.method !== 'GET' ? payload : undefined,
    });
  },

  async deleteUser(pathParams?: Record<string, string>): Promise<void> {
    let finalPath: string = USER_ENDPOINTS.DELETE_USER.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch(finalPath, {
      method: USER_ENDPOINTS.DELETE_USER.method,
      requiresAuth: USER_ENDPOINTS.DELETE_USER.requiresAuth,
    });
  },

  async addBadge(
    payload: AddBadgeToUserRequest,
    pathParams?: Record<string, string>,
  ): Promise<void> {
    let finalPath: string = USER_ENDPOINTS.ADD_BADGE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch(finalPath, {
      method: USER_ENDPOINTS.ADD_BADGE.method,
      requiresAuth: USER_ENDPOINTS.ADD_BADGE.requiresAuth,
      body: USER_ENDPOINTS.ADD_BADGE.method !== 'GET' ? payload : undefined,
    });
  },

  async removeBadge(pathParams?: Record<string, string>): Promise<void> {
    let finalPath: string = USER_ENDPOINTS.REMOVE_BADGE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch(finalPath, {
      method: USER_ENDPOINTS.REMOVE_BADGE.method,
      requiresAuth: USER_ENDPOINTS.REMOVE_BADGE.requiresAuth,
    });
  },

  async incrementImpactScore(
    payload: IncrementImpactScoreRequest,
    pathParams?: Record<string, string>,
  ): Promise<void> {
    let finalPath: string = USER_ENDPOINTS.INCREMENT_IMPACT_SCORE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch(finalPath, {
      method: USER_ENDPOINTS.INCREMENT_IMPACT_SCORE.method,
      requiresAuth: USER_ENDPOINTS.INCREMENT_IMPACT_SCORE.requiresAuth,
      body: USER_ENDPOINTS.INCREMENT_IMPACT_SCORE.method !== 'GET' ? payload : undefined,
    });
  },

  async updateMe(
    payload: UpdateUserRequest,
    pathParams?: Record<string, string>,
  ): Promise<UserWebResponse> {
    let finalPath: string = USER_ENDPOINTS.UPDATE_ME.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<UserWebResponse, UpdateUserRequest>(finalPath, {
      method: USER_ENDPOINTS.UPDATE_ME.method,
      requiresAuth: USER_ENDPOINTS.UPDATE_ME.requiresAuth,
      body: USER_ENDPOINTS.UPDATE_ME.method !== 'GET' ? payload : undefined,
    });
  },

  async deleteMe(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = USER_ENDPOINTS.DELETE_ME.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: USER_ENDPOINTS.DELETE_ME.method,
      requiresAuth: USER_ENDPOINTS.DELETE_ME.requiresAuth,
    });
  },

  async listBadges(
    payload: ListBadgesRequest,
    pathParams?: Record<string, string>,
  ): Promise<ListBadgesWebResponse> {
    let finalPath: string = USER_ENDPOINTS.LIST_BADGES.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ListBadgesWebResponse, ListBadgesRequest>(finalPath, {
      method: USER_ENDPOINTS.LIST_BADGES.method,
      requiresAuth: USER_ENDPOINTS.LIST_BADGES.requiresAuth,
      body: USER_ENDPOINTS.LIST_BADGES.method !== 'GET' ? payload : undefined,
    });
  },

  async getBadgeBySlug(pathParams?: Record<string, string>): Promise<BadgeWebResponse> {
    let finalPath: string = USER_ENDPOINTS.GET_BADGE_BY_SLUG.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<BadgeWebResponse>(finalPath, {
      method: USER_ENDPOINTS.GET_BADGE_BY_SLUG.method,
      requiresAuth: USER_ENDPOINTS.GET_BADGE_BY_SLUG.requiresAuth,
    });
  },

  async getBadge(pathParams?: Record<string, string>): Promise<BadgeWebResponse> {
    let finalPath: string = USER_ENDPOINTS.GET_BADGE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<BadgeWebResponse>(finalPath, {
      method: USER_ENDPOINTS.GET_BADGE.method,
      requiresAuth: USER_ENDPOINTS.GET_BADGE.requiresAuth,
    });
  },

  async listUsers(
    payload: ListUsersRequest,
    pathParams?: Record<string, string>,
  ): Promise<ListUsersWebResponse> {
    let finalPath: string = USER_ENDPOINTS.LIST_USERS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ListUsersWebResponse, ListUsersRequest>(finalPath, {
      method: USER_ENDPOINTS.LIST_USERS.method,
      requiresAuth: USER_ENDPOINTS.LIST_USERS.requiresAuth,
      body: USER_ENDPOINTS.LIST_USERS.method !== 'GET' ? payload : undefined,
    });
  },

  async getUser(pathParams?: Record<string, string>): Promise<UserWebResponse> {
    let finalPath: string = USER_ENDPOINTS.GET_USER.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<UserWebResponse>(finalPath, {
      method: USER_ENDPOINTS.GET_USER.method,
      requiresAuth: USER_ENDPOINTS.GET_USER.requiresAuth,
    });
  },

  async getMe(pathParams?: Record<string, string>): Promise<UserWebResponse> {
    let finalPath: string = USER_ENDPOINTS.GET_ME.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<UserWebResponse>(finalPath, {
      method: USER_ENDPOINTS.GET_ME.method,
      requiresAuth: USER_ENDPOINTS.GET_ME.requiresAuth,
    });
  },

  async getEventParticipants(
    payload: GetEventParticipantsWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<ListUsersWebResponse> {
    let finalPath: string = USER_ENDPOINTS.GET_EVENT_PARTICIPANTS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ListUsersWebResponse, GetEventParticipantsWebRequest>(finalPath, {
      method: USER_ENDPOINTS.GET_EVENT_PARTICIPANTS.method,
      requiresAuth: USER_ENDPOINTS.GET_EVENT_PARTICIPANTS.requiresAuth,
      body: USER_ENDPOINTS.GET_EVENT_PARTICIPANTS.method !== 'GET' ? payload : undefined,
    });
  },

  async getPostLikers(
    payload: GetPostLikersWebRequest,
    pathParams?: Record<string, string>,
  ): Promise<ListUsersWebResponse> {
    let finalPath: string = USER_ENDPOINTS.GET_POST_LIKERS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ListUsersWebResponse, GetPostLikersWebRequest>(finalPath, {
      method: USER_ENDPOINTS.GET_POST_LIKERS.method,
      requiresAuth: USER_ENDPOINTS.GET_POST_LIKERS.requiresAuth,
      body: USER_ENDPOINTS.GET_POST_LIKERS.method !== 'GET' ? payload : undefined,
    });
  },
};
