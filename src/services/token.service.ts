import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'volontariapp_access_token';
const REFRESH_TOKEN_KEY = 'volontariapp_refresh_token';

let webAccessToken: string | null = null;
let webRefreshToken: string | null = null;

export const TokenService = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    if (Platform.OS === 'web') {
      webAccessToken = accessToken;
      webRefreshToken = refreshToken;
      return;
    }

    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return webAccessToken;
    }
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return webRefreshToken;
    }
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async clearTokens(): Promise<void> {
    if (Platform.OS === 'web') {
      webAccessToken = null;
      webRefreshToken = null;
      return;
    }

    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },

  async deleteAccessToken(): Promise<void> {
    if (Platform.OS === 'web') {
      webAccessToken = null;
      return;
    }
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  },

  async corruptAccessToken(): Promise<void> {
    const currentToken = await this.getAccessToken();
    if (currentToken !== null) {
      const corruptedToken = currentToken.slice(0, -1) + 'X';
      if (Platform.OS === 'web') {
        webAccessToken = corruptedToken;
      } else {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, corruptedToken);
      }
    }
  },

  async deleteRefreshToken(): Promise<void> {
    if (Platform.OS === 'web') {
      webRefreshToken = null;
      return;
    }
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
