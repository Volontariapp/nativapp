import { apiFetch } from '../client';

export interface SeedBackgroundResponse {
  message: string;
}

export const adminSystemApi = {
  seedDatabase: async (): Promise<SeedBackgroundResponse> => {
    return await apiFetch<SeedBackgroundResponse>('/system/seed', {
      method: 'POST',
    });
  },
};
