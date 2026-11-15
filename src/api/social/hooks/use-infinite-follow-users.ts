import { useInfiniteQuery } from '@tanstack/react-query';
import type { UserWeb } from '@volontariapp/contracts';
import { socialApi } from '../social.api';
import { userApi, type UserPublicProfile } from '@/api/user/user.api';

export type FollowListMode = 'followers' | 'following';

export interface FollowUsersPage {
  users: UserPublicProfile[];
  totalCount: number;
}

interface RawFollowResponse {
  users?: UserWeb[];
  ids?: string[];
  pagination?: {
    total?: number;
  };
}

const toPublicProfile = (user: UserWeb): UserPublicProfile => ({
  id: user.id,
  pseudo: user.pseudo,
  totalImpactScore: user.totalImpactScore,
  bio: user.bio,
  logoPath: user.logoPath,
  avatarUrl: user.avatarUrl,
  badges: user.badges,
});

const normalizeFollowResponse = async (raw: RawFollowResponse): Promise<FollowUsersPage> => {
  if (Array.isArray(raw.users)) {
    const users = raw.users.map(toPublicProfile);
    return {
      users,
      totalCount: raw.pagination?.total ?? users.length,
    };
  }

  const ids = Array.isArray(raw.ids) ? raw.ids : [];
  const users = await Promise.all(ids.map((id) => userApi.getPublicUser(id)));
  return {
    users,
    totalCount: raw.pagination?.total ?? users.length,
  };
};

const fetchFollowUsersPage = async (
  userId: string,
  mode: FollowListMode,
  isSelf: boolean,
  page: number,
  limit: number,
): Promise<FollowUsersPage> => {
  if (isSelf) {
    try {
      const selfRes =
        mode === 'followers'
          ? await socialApi.getMyFollowers({ page, limit })
          : await socialApi.getMyFollows({ page, limit });
      return await normalizeFollowResponse(selfRes);
    } catch {
      // Repli sur l'endpoint par userId si l'endpoint self n'est pas disponible
    }
  }

  const res =
    mode === 'followers'
      ? await socialApi.getFollowers(userId, { page, limit })
      : await socialApi.getFollows(userId, { page, limit });
  return await normalizeFollowResponse(res);
};

export const useInfiniteFollowUsers = (
  userId: string | undefined,
  mode: FollowListMode,
  isSelf: boolean,
  limit = 20,
) =>
  useInfiniteQuery({
    queryKey: ['follow-users-list', mode, userId, isSelf, limit],
    queryFn: ({ pageParam }) =>
      fetchFollowUsersPage(userId ?? '', mode, isSelf, pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.users.length, 0);
      return lastPage.users.length > 0 && loaded < lastPage.totalCount
        ? allPages.length + 1
        : undefined;
    },
    enabled: userId !== undefined && userId.length > 0,
  });
