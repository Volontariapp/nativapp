import type { UserProfile } from '@/api/user/user.api';

export const createProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: '76c5b964-b5a1-43e3-85e2-040683457e56',
  email: 'john.doe@example.com',
  pseudo: 'john_doe',
  role: 'VOLUNTEER',
  totalImpactScore: 12,
  badges: [],
  ...overrides,
});
