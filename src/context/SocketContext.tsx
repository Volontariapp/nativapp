import React, { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import { PROFILE_QUERY_KEY } from '@/api/user/hooks/use-profile';
import { socketService } from '../services/socket.service';
import { useAuth } from './AuthContext';
import { TokenService } from '../services/token.service';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

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
      // Reconnexion : des evenements (ex. credit de score) ont pu etre manques.
      if (hasDisconnected) {
        void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
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

    // Safety-net: poll socket.connected every 3s in case the disconnect event
    // is delayed (e.g. heartbeat timeout, polling transport lag).
    const interval = setInterval(() => {
      const s = socketRef.current;
      setIsConnected(s?.connected ?? false);
    }, 3000);

    return (): void => {
      isMounted = false;
      clearInterval(interval);
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
