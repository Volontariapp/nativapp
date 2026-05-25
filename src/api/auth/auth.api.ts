import { apiFetch } from '../client';
import { AUTH_ENDPOINTS } from '../endpoints';
import type {
  SignUpCommand,
  SignUpResponse,
  LoginCommand,
  LoginResponse,
} from '@volontariapp/contracts';
import { TokenService } from '../../services/token.service';

export const authApi = {
  async register(payload: SignUpCommand): Promise<SignUpResponse> {
    const response = await apiFetch<SignUpResponse, SignUpCommand>(AUTH_ENDPOINTS.REGISTER.path, {
      method: AUTH_ENDPOINTS.REGISTER.method,
      requiresAuth: AUTH_ENDPOINTS.REGISTER.requiresAuth,
      body: payload,
    });

    if (response.auth !== undefined) {
      await TokenService.saveTokens(response.auth.accessToken, response.auth.refreshToken);
    }

    return response;
  },

  async login(payload: LoginCommand): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse, LoginCommand>(AUTH_ENDPOINTS.LOGIN.path, {
      method: AUTH_ENDPOINTS.LOGIN.method,
      requiresAuth: AUTH_ENDPOINTS.LOGIN.requiresAuth,
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
