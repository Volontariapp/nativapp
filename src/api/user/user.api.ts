import { apiFetch } from '../client';
import { USER_ENDPOINTS } from '../endpoints';
import type {
  GetUserWebResponse,
  PublicUserWebResponse,
  BadgeWeb,
  UpdateUserRequest,
  UserWebResponse,
  ListUsersWebResponse,
} from '@volontariapp/contracts';

export interface UserProfile {
  id: string;
  email: string;
  pseudo: string;
  role: string;
  totalImpactScore: number;
  bio?: string;
  logoPath?: string;
  badges: BadgeWeb[];
}

export interface UserPublicProfile {
  id: string;
  pseudo: string;
  totalImpactScore: number;
  bio?: string;
  logoPath?: string;
  badges: BadgeWeb[];
}

export const userApi = {
  async getMe(): Promise<UserProfile> {
    try {
      const response = await apiFetch<GetUserWebResponse>(USER_ENDPOINTS.GET_ME.path, {
        method: USER_ENDPOINTS.GET_ME.method,
        requiresAuth: USER_ENDPOINTS.GET_ME.requiresAuth,
      });

      if (!response.user) {
        throw new Error('User data not found');
      }

      return {
        id: response.user.id,
        email: response.user.email,
        pseudo: response.user.pseudo,
        role: response.user.role,
        totalImpactScore: response.user.totalImpactScore,
        bio: response.user.bio,
        logoPath: response.user.logoPath,
        badges: response.user.badges,
      };
    } catch (error) {
      console.error(
        '[userApi.getMe] Error details:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },

  async getUser(userId: string): Promise<UserProfile> {
    try {
      const response = await apiFetch<GetUserWebResponse>(
        USER_ENDPOINTS.GET_USER.path.replace(':id', userId),
        {
          method: USER_ENDPOINTS.GET_ME.method,
          requiresAuth: USER_ENDPOINTS.GET_ME.requiresAuth,
        },
      );

      if (!response.user) {
        throw new Error('User data not found');
      }

      return {
        id: response.user.id,
        email: response.user.email,
        pseudo: response.user.pseudo,
        role: response.user.role,
        totalImpactScore: response.user.totalImpactScore,
        bio: response.user.bio,
        logoPath: response.user.logoPath,
        badges: response.user.badges,
      };
    } catch (error) {
      console.error(
        '[userApi.getUser] Error details:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },

  async getPublicUser(userId: string): Promise<UserPublicProfile> {
    try {
      const response = await apiFetch<PublicUserWebResponse>(
        USER_ENDPOINTS.GET_PUBLIC_USER.path.replace(':id', userId),
        {
          method: USER_ENDPOINTS.GET_PUBLIC_USER.method,
          requiresAuth: USER_ENDPOINTS.GET_PUBLIC_USER.requiresAuth,
        },
      );

      if (!response.user) {
        throw new Error('User data not found');
      }

      return {
        id: response.user.id,
        pseudo: response.user.pseudo,
        totalImpactScore: response.user.totalImpactScore,
        bio: response.user.bio,
        logoPath: response.user.logoPath,
        badges: response.user.badges,
      };
    } catch (error) {
      console.error(
        '[userApi.getPublicUser] Error details:',
        error instanceof Error ? error.message : String(error),
      );
      return {
        id: userId,
        pseudo: 'Utilisateur inconnu',
        totalImpactScore: 0,
        badges: [],
      };
    }
  },

  async updateMe(payload: UpdateUserRequest): Promise<void> {
    try {
      await apiFetch<UserWebResponse, UpdateUserRequest>(USER_ENDPOINTS.UPDATE_ME.path, {
        method: USER_ENDPOINTS.UPDATE_ME.method,
        requiresAuth: USER_ENDPOINTS.UPDATE_ME.requiresAuth,
        body: payload,
      });
    } catch (error) {
      console.error(
        '[userApi.updateMe] Error details:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },

  async getPostLikers(
    postId: string,
    params?: { page?: number; limit?: number },
  ): Promise<{ users: UserPublicProfile[]; totalCount: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.page !== undefined) query.append('page', params.page.toString());
      if (params?.limit !== undefined) query.append('limit', params.limit.toString());

      const queryString = query.toString();
      const rawPath = USER_ENDPOINTS.GET_POST_LIKERS.path.replace(':postId', postId);
      const path = queryString ? `${rawPath}?${queryString}` : rawPath;

      const response = await apiFetch<ListUsersWebResponse>(path, {
        method: USER_ENDPOINTS.GET_POST_LIKERS.method,
        requiresAuth: USER_ENDPOINTS.GET_POST_LIKERS.requiresAuth,
      });

      return {
        users: response.users.map((u) => ({
          id: u.id,
          pseudo: u.pseudo,
          totalImpactScore: u.totalImpactScore,
          bio: u.bio,
          logoPath: u.logoPath,
          badges: u.badges,
        })),
        totalCount: response.pagination?.total ?? 0,
      };
    } catch (error) {
      console.error(
        '[userApi.getPostLikers] Error details:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },
};
