import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'volontariapp_access_token';
const REFRESH_TOKEN_KEY = 'volontariapp_refresh_token';

export const TokenService = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } catch (e) {
        console.error('Local storage is unavailable:', e instanceof Error ? e.message : String(e));
      }
      return;
    }

    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
      } catch (e) {
        console.error('Local storage is unavailable:', e instanceof Error ? e.message : String(e));
        return null;
      }
    }
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
      } catch (e) {
        console.error('Local storage is unavailable:', e instanceof Error ? e.message : String(e));
        return null;
      }
    }
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async clearTokens(): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      } catch (e) {
        console.error('Local storage is unavailable:', e instanceof Error ? e.message : String(e));
      }
      return;
    }

    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};
