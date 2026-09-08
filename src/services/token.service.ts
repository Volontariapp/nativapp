import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'volontariapp_access_token';
const REFRESH_TOKEN_KEY = 'volontariapp_refresh_token';

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

export const TokenService = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    memoryAccessToken = accessToken;
    memoryRefreshToken = refreshToken;

    if (Platform.OS !== 'web') {
      await Promise.all([
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
      ]);
    }
  },

  async getAccessToken(): Promise<string | null> {
    if (memoryAccessToken !== null) {
      return memoryAccessToken;
    }
    if (Platform.OS === 'web') {
      return null;
    }
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    memoryAccessToken = token;
    return token;
  },

  async getRefreshToken(): Promise<string | null> {
    if (memoryRefreshToken !== null) {
      return memoryRefreshToken;
    }
    if (Platform.OS === 'web') {
      return null;
    }
    const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    memoryRefreshToken = token;
    return token;
  },

  async clearTokens(): Promise<void> {
    memoryAccessToken = null;
    memoryRefreshToken = null;

    if (Platform.OS !== 'web') {
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      ]);
    }
  },

  async deleteAccessToken(): Promise<void> {
    memoryAccessToken = null;
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    }
  },

  async corruptAccessToken(): Promise<void> {
    const currentToken = await this.getAccessToken();
    if (currentToken !== null) {
      const corruptedToken = currentToken.slice(0, -1) + 'X';
      memoryAccessToken = corruptedToken;
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, corruptedToken);
      }
    }
  },

  async deleteRefreshToken(): Promise<void> {
    memoryRefreshToken = null;
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  },
};
