import { apiFetch } from '../../client';
import { userApi } from '../user.api';
import {
  AVATAR_FILE_ID,
  AVATAR_URL,
  createGetUserResponse,
  createPublicUserResponse,
} from './user.factory';

jest.mock('../../client', () => ({ apiFetch: jest.fn() }));

const apiFetchMock = jest.mocked(apiFetch);

describe('userApi avatar exposure', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getMe', () => {
    it('exposes the avatar URL computed by the gateway', async () => {
      apiFetchMock.mockResolvedValue(
        createGetUserResponse({ avatarFileId: AVATAR_FILE_ID, avatarUrl: AVATAR_URL }),
      );

      const profile = await userApi.getMe();

      expect(profile.avatarUrl).toBe(AVATAR_URL);
    });

    it('leaves the avatar URL undefined when the user has no avatar', async () => {
      apiFetchMock.mockResolvedValue(createGetUserResponse());

      const profile = await userApi.getMe();

      expect(profile.avatarUrl).toBeUndefined();
    });
  });

  describe('getPublicUser', () => {
    it('exposes the avatar URL of the public profile', async () => {
      apiFetchMock.mockResolvedValue(
        createPublicUserResponse({ avatarFileId: AVATAR_FILE_ID, avatarUrl: AVATAR_URL }),
      );

      const profile = await userApi.getPublicUser('someone');

      expect(profile.avatarUrl).toBe(AVATAR_URL);
    });
  });
});
