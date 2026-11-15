import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { TokenService } from '../../services/token.service';
import { authExpiredBus } from '../../services/event-bus.service';
import { AuthContext } from './auth.context';
import type { JwtPayload } from './auth.types';
import type { UserRoles } from '@volontariapp/shared';
import { socketService } from '../../services/socket.service';
import { apiFetch } from '../../api/client';
import { clearMonitoringUser, setMonitoringUser } from '../../shared/lib/monitoring';

export const AuthProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRoles | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Le client de requetes est un singleton de l'app : une ref le garde hors des dependances des
  // effets qui appellent logout (sinon logout devient reactif et ces effets se relancent).
  const queryClientRef = useRef(useQueryClient());

  const logout = async (): Promise<void> => {
    socketService.disconnect();
    await TokenService.clearTokens();
    // Les listes en cache (ranking, wishlist, profil...) appartiennent au compte qui part : sans
    // ce vidage, le compte suivant les afficherait jusqu'au prochain refetch.
    queryClientRef.current.clear();
    setUserId(null);
    setRole(null);
  };

  const loadToken = async (): Promise<void> => {
    try {
      const accessToken = await TokenService.getAccessToken();
      const refreshToken = await TokenService.getRefreshToken();

      if (accessToken === null && refreshToken === null) {
        await logout();
        return;
      }

      let activeAccessToken: string | null = accessToken;

      if (accessToken !== null) {
        const decodedAt = jwtDecode<JwtPayload>(accessToken);
        const isAtExpired = decodedAt.exp !== undefined && decodedAt.exp * 1000 < Date.now();
        if (isAtExpired) {
          activeAccessToken = null;
        }
      }

      if (activeAccessToken === null && refreshToken !== null) {
        const decodedRt = jwtDecode<JwtPayload>(refreshToken);
        const isRtExpired = decodedRt.exp !== undefined && decodedRt.exp * 1000 < Date.now();

        if (isRtExpired) {
          throw new Error('Refresh token expired');
        }

        const res = await apiFetch<
          { auth: { accessToken: string; refreshToken: string } },
          { refreshToken: string }
        >('/users/refresh', {
          method: 'POST',
          requiresAuth: false,
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
          body: { refreshToken },
        });

        activeAccessToken = res.auth.accessToken;
        await TokenService.saveTokens(res.auth.accessToken, res.auth.refreshToken);
      }

      if (activeAccessToken !== null) {
        const decoded = jwtDecode<JwtPayload>(activeAccessToken);
        setUserId(decoded.id);
        setRole(decoded.role ?? null);
      } else {
        throw new Error('No active token');
      }
    } catch {
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadToken();
  }, []);

  // Les erreurs remontees a Datadog portent l'identifiant de l'utilisateur connecte, jamais son
  // email ni son nom.
  useEffect(() => {
    if (userId === null) {
      void clearMonitoringUser();
      return;
    }
    void setMonitoringUser(userId);
  }, [userId]);

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
    setUserId(decoded.id);
    setRole(decoded.role ?? null);
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
