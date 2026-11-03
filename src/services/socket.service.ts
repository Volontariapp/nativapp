import type { Socket, ManagerOptions, SocketOptions } from 'socket.io-client';
import { io } from 'socket.io-client';
import { Platform } from 'react-native';
import axios from 'axios';
import { refreshAccessToken } from '../api/client';
import { config } from '../shared/config/base-config';
import { isJwtExpired } from '../shared/utils/jwt-expiry';
import { authExpiredBus } from './event-bus.service';
import { TokenService } from './token.service';

class SocketService {
  private socket: Socket | null = null;
  private credentialsRefresh: Promise<void> | null = null;
  private currentToken: string | null = null;

  public connect(token: string): Socket {
    if (this.socket) {
      // socket.active vaut true tant que l'instance est connectee ou en cours de (re)connexion
      // automatique; il passe a false apres un disconnect() volontaire ou une deconnexion
      // decidee par le serveur. On reutilise donc l'instance sauf si le token a change.
      if (this.currentToken === token && this.socket.active) {
        return this.socket;
      }
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentToken = token;

    const base = config.apiGatewayUrl.replace(/\/$/, '');

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (config.cloudflareAccess) {
      headers['CF-Access-Client-Id'] = config.cloudflareAccess.clientId;
      headers['CF-Access-Client-Secret'] = config.cloudflareAccess.clientSecret;
    }

    const ioOptions: Partial<ManagerOptions & SocketOptions> = {
      path: '/api/v1/socket.io',
      query: { token },
      extraHeaders: headers,
      transports: Platform.OS === 'web' ? ['polling'] : ['websocket'],
    };

    ioOptions.withCredentials = true;

    this.socket = io(base, ioOptions);

    this.socket.on('unauthorized', () => {
      this.disconnect();
    });

    // socket.io rejoue les options d'origine a chaque reconnexion : sans cette mise a jour,
    // le token expire serait renvoye en boucle a la gateway (401 a chaque tentative).
    this.socket.on('connect_error', () => {
      this.credentialsRefresh ??= this.refreshCredentials().finally(() => {
        this.credentialsRefresh = null;
      });
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentToken = null;
  }

  private async refreshCredentials(): Promise<void> {
    const socket = this.socket;
    if (socket === null) {
      return;
    }

    try {
      let token = await TokenService.getAccessToken();
      if (token === null || isJwtExpired(token)) {
        token = await refreshAccessToken();
      }
      if (token === null) {
        this.expireSession();
        return;
      }
      if (this.socket !== socket) {
        return;
      }
      this.currentToken = token;
      socket.io.opts.query = { token };
      socket.io.opts.extraHeaders = {
        ...socket.io.opts.extraHeaders,
        Authorization: `Bearer ${token}`,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
        this.expireSession();
      }
      // Erreur reseau : socket.io retentera, le refresh sera rejoue au prochain connect_error.
    }
  }

  private expireSession(): void {
    this.disconnect();
    authExpiredBus.emit();
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
