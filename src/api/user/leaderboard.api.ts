import type {
  GetLeaderboardRequest,
  GetLeaderboardWebResponse,
  GetMyRankWebResponse,
  LeaderboardScopeWeb,
} from '@volontariapp/contracts';
import { apiFetch } from '../client';
import { USER_ENDPOINTS } from '../endpoints';

const withQuery = (path: string, query: URLSearchParams): string => {
  const queryString = query.toString();
  return queryString === '' ? path : `${path}?${queryString}`;
};

export const leaderboardApi = {
  /** Une page du classement : global (tous temps), semaine ou mois. Pagination par curseur. */
  async getLeaderboard(params: GetLeaderboardRequest): Promise<GetLeaderboardWebResponse> {
    const endpoint = USER_ENDPOINTS.GET_LEADERBOARD;
    try {
      const query = new URLSearchParams();
      if (params.scope !== undefined) query.append('scope', params.scope);
      if (params.cursor !== undefined) query.append('cursor', params.cursor);
      if (params.limit !== undefined) query.append('limit', params.limit.toString());

      return await apiFetch<GetLeaderboardWebResponse>(withQuery(endpoint.path, query), {
        method: endpoint.method,
        requiresAuth: endpoint.requiresAuth,
      });
    } catch (error) {
      console.error(
        '[leaderboardApi.getLeaderboard] Error details:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },

  /** Mon rang, mes points et les cinq voisins au-dessus et en dessous. `me` est absent sans points. */
  async getMyRank(scope: LeaderboardScopeWeb): Promise<GetMyRankWebResponse> {
    const endpoint = USER_ENDPOINTS.GET_MY_RANK;
    try {
      const query = new URLSearchParams({ scope });
      return await apiFetch<GetMyRankWebResponse>(withQuery(endpoint.path, query), {
        method: endpoint.method,
        requiresAuth: endpoint.requiresAuth,
      });
    } catch (error) {
      console.error(
        '[leaderboardApi.getMyRank] Error details:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },
};
