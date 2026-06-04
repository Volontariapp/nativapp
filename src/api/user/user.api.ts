import { apiFetch } from '../client';
import { USER_ENDPOINTS } from '../endpoints';
import type {
  GetUserWebResponse,
  BadgeWeb,
  UpdateUserRequest,
  UserWebResponse,
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

export const userApi = {
  async getMe(): Promise<UserProfile> {
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
  },

  async updateMe(payload: UpdateUserRequest): Promise<void> {
    await apiFetch<UserWebResponse, UpdateUserRequest>(USER_ENDPOINTS.UPDATE_ME.path, {
      method: USER_ENDPOINTS.UPDATE_ME.method,
      requiresAuth: USER_ENDPOINTS.UPDATE_ME.requiresAuth,
      body: payload,
    });
  },
};
