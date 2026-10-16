import { apiFetch } from '../../client';
import { userApi } from '../user.api';
import {
  AVATAR_FILE_ID,
  AVATAR_URL,
  createGetUserResponse,
  createListUsersResponse,
  createPublicUserResponse,
  createUserWeb,
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

  describe('getEventParticipants', () => {
    it('lists the first participants of the event with their avatar URL', async () => {
      apiFetchMock.mockResolvedValue(
        createListUsersResponse([
          createUserWeb({ id: 'p1', avatarUrl: AVATAR_URL }),
          createUserWeb({ id: 'p2' }),
        ]),
      );

      const participants = await userApi.getEventParticipants('event-1', { page: 1, limit: 5 });

      expect(apiFetchMock).toHaveBeenCalledWith(
        '/users/event/event-1/participants?pagination%5Bpage%5D=1&pagination%5Blimit%5D=5',
        {
          method: 'GET',
          requiresAuth: true,
        },
      );
      expect(participants.map((p) => p.avatarUrl)).toEqual([AVATAR_URL, undefined]);
    });
  });

  describe('getPostLikers', () => {
    it('keeps the avatar URL of every liker', async () => {
      apiFetchMock.mockResolvedValue(
        createListUsersResponse([createUserWeb({ id: 'p1', avatarUrl: AVATAR_URL })]),
      );

      const { users } = await userApi.getPostLikers('post-1');

      expect(users[0]?.avatarUrl).toBe(AVATAR_URL);
    });
  });
});
