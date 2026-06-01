import type { Socket, ManagerOptions, SocketOptions } from 'socket.io-client';
import { io } from 'socket.io-client';
import { Platform } from 'react-native';
import { config } from '../shared/config/base-config';

class SocketService {
  private socket: Socket | null = null;

  public connect(token: string): Socket {
    if (this.socket) {
      if (this.socket.connected) {
        return this.socket;
      }
      this.socket.disconnect();
    }

    const base = config.apiGatewayUrl.replace(/\/$/, '');

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (Platform.OS === 'web' && config.cloudflareAccess) {
      headers['CF-Access-Client-Id'] = config.cloudflareAccess.clientId;
      headers['CF-Access-Client-Secret'] = config.cloudflareAccess.clientSecret;
    }

    const ioOptions: Partial<ManagerOptions & SocketOptions> = {
      path: '/api/v1/socket.io',
      query: { token },
      extraHeaders: headers,
      transports: ['polling', 'websocket'],
    };

    if (Platform.OS === 'web') {
      ioOptions.withCredentials = true;
    }

    this.socket = io(base, ioOptions);

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('unauthorized', (error) => {
      console.error('Socket unauthorized:', error);
      this.disconnect();
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
