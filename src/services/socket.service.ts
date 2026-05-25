import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
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

    this.socket = io(base, {
      path: '/api/v1/socket.io',
      query: { token },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ['polling', 'websocket'],
    });

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
