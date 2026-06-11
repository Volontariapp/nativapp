import type { UserRoles } from '@volontariapp/shared';

export interface JwtPayload {
  id: string;
  role?: UserRoles;
  exp?: number;
  iat?: number;
}

export interface AuthContextValue {
  userId: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}
