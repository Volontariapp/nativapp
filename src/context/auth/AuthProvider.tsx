import React, { useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { TokenService } from '../../services/token.service';
import { authExpiredBus } from '../../services/event-bus.service';
import { AuthContext } from './auth.context';
import type { JwtPayload } from './auth.types';
import type { UserRoles } from '@volontariapp/shared';

export const AuthProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRoles | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadToken = async (): Promise<void> => {
    try {
      const token = await TokenService.getAccessToken();
      if (token !== null) {
        const decoded = jwtDecode<JwtPayload>(token);

        if (decoded.exp !== undefined && decoded.exp * 1000 < Date.now()) {
          throw new Error('Token expired');
        }

        setUserId(decoded.sub);
        setRole(decoded.role ?? null);
      }
    } catch {
      await TokenService.clearTokens();
      setUserId(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadToken();
  }, []);

  useEffect(() => {
    const unsubscribe = authExpiredBus.subscribe(() => {
      void logout();
    });
    return (): void => {
      unsubscribe();
    };
  }, []);

  const login = async (accessToken: string, refreshToken: string): Promise<void> => {
    await TokenService.saveTokens(accessToken, refreshToken);
    const decoded = jwtDecode<JwtPayload>(accessToken);
    setUserId(decoded.sub);
    setRole(decoded.role ?? null);
  };

  const logout = async (): Promise<void> => {
    await TokenService.clearTokens();
    setUserId(null);
    setRole(null);
  };

  const value = React.useMemo(
    () => ({
      userId,
      role,
      isAuthenticated: userId !== null,
      isLoading,
      login,
      logout,
    }),
    [userId, role, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
