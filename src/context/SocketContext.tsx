import React, { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import { COMMENTS_LIST_QUERY_KEY } from '@/api/post/hooks/use-list-comments';
import { LIKES_SUMMARY_QUERY_KEY } from '@/api/social/likes-summary.cache';
import { PROFILE_QUERY_KEY } from '@/api/user/hooks/use-profile';
import { socketService } from '../services/socket.service';
import { useAuth } from './AuthContext';
import { TokenService } from '../services/token.service';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

/**
 * Cles invalidees apres une reconnexion : likes, commentaires, ranking et profil
 * peuvent avoir change pendant la coupure sans que l'evenement n'arrive.
 */
export const RESYNC_QUERY_KEYS: readonly (readonly unknown[])[] = [
  PROFILE_QUERY_KEY,
  ['my-likes'],
  LIKES_SUMMARY_QUERY_KEY,
  ['ranking'],
  COMMENTS_LIST_QUERY_KEY,
  ['post-likers'],
];

/** Intervalle du filet de securite sur socket.connected (les evenements restent la source principale). */
export const CONNECTION_POLL_INTERVAL_MS = 15000;

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = (): SocketContextType => use(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps): React.JSX.Element => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let currentSocket: Socket | null = null;
    let isMounted = true;
    let hasDisconnected = false;

    const handleConnect = (): void => {
      if (!isMounted) return;
      setIsConnected(true);
      // Reconnexion : des evenements (score, likes, commentaires, ranking) ont pu etre manques.
      if (hasDisconnected) {
        hasDisconnected = false;
        RESYNC_QUERY_KEYS.forEach((queryKey) => {
          void queryClient.invalidateQueries({ queryKey });
        });
      }
    };
    const handleDisconnect = (): void => {
      hasDisconnected = true;
      if (isMounted) setIsConnected(false);
    };
    const handleConnectError = (): void => {
      if (isMounted) setIsConnected(false);
    };

    const connectSocket = async (): Promise<void> => {
      if (isAuthenticated) {
        const token = await TokenService.getAccessToken();
        if (token !== null && isMounted) {
          currentSocket = socketService.connect(token);
          socketRef.current = currentSocket;
          setSocket(currentSocket);

          currentSocket.on('connect', handleConnect);
          currentSocket.on('disconnect', handleDisconnect);
          currentSocket.on('connect_error', handleConnectError);
          if (currentSocket.connected) {
            setIsConnected(true);
          }
        }
      } else {
        if (isMounted) {
          socketService.disconnect();
          socketRef.current = null;
          setSocket(null);
          setIsConnected(false);
        }
      }
    };

    void connectSocket();

    // Retour au premier plan : le systeme peut avoir suspendu le socket en arriere-plan.
    // socket.connect() relance la reconnexion sans recreer l'instance.
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      const s = socketRef.current;
      if (state === 'active' && s !== null && !s.connected) {
        s.connect();
      }
    });

    // Filet de securite : les evenements connect / disconnect / connect_error couvrent les cas
    // nominaux; ce poll ne rattrape qu'un evenement perdu (lag du transport polling), donc
    // un intervalle de 15 s suffit au lieu de 3 s.
    const interval = setInterval(() => {
      const s = socketRef.current;
      setIsConnected(s?.connected ?? false);
    }, CONNECTION_POLL_INTERVAL_MS);

    return (): void => {
      isMounted = false;
      clearInterval(interval);
      appStateSubscription.remove();
      if (currentSocket !== null) {
        currentSocket.off('connect', handleConnect);
        currentSocket.off('disconnect', handleDisconnect);
        currentSocket.off('connect_error', handleConnectError);
      }
    };
  }, [isAuthenticated, queryClient]);

  const contextValue = React.useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};
