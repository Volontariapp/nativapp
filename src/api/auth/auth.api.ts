import { apiFetch } from '../client';
import { USER_ENDPOINTS } from '../endpoints';
import type {
  SignUpCommand,
  SignUpResponse,
  LoginCommand,
  LoginResponse,
} from '@volontariapp/contracts';
import { TokenService } from '../../services/token.service';

export const authApi = {
  async register(payload: SignUpCommand): Promise<SignUpResponse> {
    const response = await apiFetch<SignUpResponse, SignUpCommand>(USER_ENDPOINTS.SIGN_UP.path, {
      method: USER_ENDPOINTS.SIGN_UP.method,
      requiresAuth: USER_ENDPOINTS.SIGN_UP.requiresAuth,
      body: payload,
    });

    if (response.auth !== undefined) {
      await TokenService.saveTokens(response.auth.accessToken, response.auth.refreshToken);
    }

    return response;
  },

  async login(payload: LoginCommand): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse, LoginCommand>(USER_ENDPOINTS.LOGIN.path, {
      method: USER_ENDPOINTS.LOGIN.method,
      requiresAuth: USER_ENDPOINTS.LOGIN.requiresAuth,
      body: payload,
    });

    if (response.auth !== undefined) {
      await TokenService.saveTokens(response.auth.accessToken, response.auth.refreshToken);
    }

    return response;
  },

  async logout(): Promise<void> {
    await TokenService.clearTokens();
  },
};
