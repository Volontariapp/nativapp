import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Socket } from 'socket.io-client';
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

export const useSocket = (): SocketContextType => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps): React.JSX.Element => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // Keep a ref to always access the latest socket in the polling interval
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let currentSocket: Socket | null = null;

    const connectSocket = async (): Promise<void> => {
      if (isAuthenticated) {
        const token = await TokenService.getAccessToken();
        if (token !== null) {
          currentSocket = socketService.connect(token);
          socketRef.current = currentSocket;
          setSocket(currentSocket);

          currentSocket.on('connect', () => {
            setIsConnected(true);
          });
          currentSocket.on('disconnect', () => {
            setIsConnected(false);
          });
          currentSocket.on('connect_error', () => {
            setIsConnected(false);
          });

          if (currentSocket.connected) {
            setIsConnected(true);
          }
        }
      } else {
        socketService.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
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
      clearInterval(interval);
      if (currentSocket !== null) {
        currentSocket.off('connect');
        currentSocket.off('disconnect');
        currentSocket.off('connect_error');
      }
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
};
