import { apiFetch } from '../client';

export type SeedPreset = 'quick' | 'standard' | '500' | 'mega-1000';

export interface SeedOptions {
  preset?: SeedPreset;
  userCount?: number;
  eventCount?: number;
  postCount?: number;
  seedMedia?: boolean;
  concurrency?: number;
}

export interface SeedCountStats {
  success: number;
  failed: number;
}

export interface SeedStatusResponse {
  users: SeedCountStats;
  events: SeedCountStats;
  posts: SeedCountStats;
  comments: SeedCountStats;
  likes: SeedCountStats;
  participations: SeedCountStats;
  wishes: SeedCountStats;
  follows: SeedCountStats;
  media: SeedCountStats;
  durationMs: number;
}

export interface SeedBackgroundResponse {
  message: string;
  options?: SeedOptions;
}

export const adminSystemApi = {
  seedDatabase: async (options?: SeedOptions): Promise<SeedBackgroundResponse> => {
    return await apiFetch<SeedBackgroundResponse, SeedOptions>('/system/seed', {
      method: 'POST',
      body: options ?? { preset: '500', seedMedia: true },
    });
  },
  getSeedStatus: async (): Promise<SeedStatusResponse> => {
    return await apiFetch<SeedStatusResponse>('/system/seed/status');
  },
};
