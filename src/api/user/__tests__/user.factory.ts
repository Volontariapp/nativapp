import type {
  GetUserWebResponse,
  ListUsersWebResponse,
  PublicUserWebResponse,
  UserWeb,
} from '@volontariapp/contracts';
import type { UserPublicProfile } from '../user.api';

export const USER_ID = '76c5b964-b5a1-43e3-85e2-040683457e56';
export const AVATAR_FILE_ID = '5d0e4a3c-7f0b-4b76-9a52-0d1f4f3b9e11';
export const AVATAR_URL = `https://cdn.test/user-avatar/${AVATAR_FILE_ID}.webp`;

export const createUserWeb = (overrides: Partial<UserWeb> = {}): UserWeb => ({
  id: USER_ID,
  email: 'john.doe@example.com',
  pseudo: 'john_doe',
  role: 'VOLUNTEER',
  totalImpactScore: 12,
  badges: [],
  ...overrides,
});

export const createGetUserResponse = (overrides: Partial<UserWeb> = {}): GetUserWebResponse => ({
  user: createUserWeb(overrides),
});

export const createPublicUserResponse = (
  overrides: Partial<UserWeb> = {},
): PublicUserWebResponse => {
  const user = createUserWeb(overrides);
  return {
    user: {
      id: user.id,
      pseudo: user.pseudo,
      totalImpactScore: user.totalImpactScore,
      bio: user.bio,
      logoPath: user.logoPath,
      avatarFileId: user.avatarFileId,
      avatarUrl: user.avatarUrl,
      badges: user.badges,
    },
  };
};

export const createUserPublicProfile = (
  overrides: Partial<UserPublicProfile> = {},
): UserPublicProfile => ({
  id: USER_ID,
  pseudo: 'john_doe',
  totalImpactScore: 12,
  badges: [],
  ...overrides,
});

export const createListUsersResponse = (users: UserWeb[]): ListUsersWebResponse => ({
  users,
  pagination: { total: users.length, page: 1, limit: 5, totalPages: 1 },
});
