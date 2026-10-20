import type {
  GetRankingEventsWebRequest,
  GetRankingEventsWebResponse,
  GetRankingFeedWebRequest,
  GetRankingFeedWebResponse,
  RankedEventWeb,
  RankedPostWeb,
  RankingMetaWeb,
  RankingReasonWeb,
  RequestRankingRefreshWebResponse,
  UpdateUserLocationWebResponse,
  RecordEventFeedbackWebResponse,
  RankingListKindWeb,
} from '@volontariapp/contracts';
import { convertEventDtoToAppEvent, type AppEvent } from '../event/event.api';
import { apiFetch } from '../client';
import { RANKING_ENDPOINTS } from '../endpoints/ranking.endpoints';

export interface RankedAppEvent extends AppEvent {
  rankingScore?: number;
  reasons?: RankingReasonWeb[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RankedAppPost extends RankedPostWeb {}

export interface RankingEventsPage {
  events: RankedAppEvent[];
  totalCount: number;
  ranking: RankingMetaWeb;
  isFallback: false;
}

export interface RankingEventsFallback {
  events: [];
  totalCount: 0;
  ranking: null;
  isFallback: true;
}

export type RankingEventsResult = RankingEventsPage | RankingEventsFallback;

export interface RankingFeedPage {
  posts: RankedAppPost[];
  totalCount: number;
  ranking: RankingMetaWeb;
  isFallback: false;
}

export interface RankingFeedFallback {
  posts: [];
  totalCount: 0;
  ranking: null;
  isFallback: true;
}

export type RankingFeedResult = RankingFeedPage | RankingFeedFallback;

const isFallbackResponse = (data: unknown, listKey: 'events' | 'posts'): boolean => {
  if (data == null || typeof data !== 'object') return true;
  const record = data as Record<string, unknown>;
  if (record.code === 'FALLBACK_ACTIVATED') return true;
  if (!Array.isArray(record[listKey])) return true;
  return false;
};

export const rankingApi = {
  async getEvents(params?: GetRankingEventsWebRequest): Promise<RankingEventsResult> {
    const raw = await apiFetch<GetRankingEventsWebResponse | Record<string, unknown>>(
      RANKING_ENDPOINTS.GET_EVENTS.path,
      {
        method: RANKING_ENDPOINTS.GET_EVENTS.method,
        requiresAuth: RANKING_ENDPOINTS.GET_EVENTS.requiresAuth,
        params,
      },
    );

    if (isFallbackResponse(raw, 'events')) {
      return {
        events: [],
        totalCount: 0,
        ranking: null,
        isFallback: true,
      };
    }

    const response = raw as GetRankingEventsWebResponse;
    const events = response.events.map((e: RankedEventWeb): RankedAppEvent => ({
      ...convertEventDtoToAppEvent(e),
      rankingScore: e.rankingScore,
      reasons: e.reasons,
    }));

    return {
      events,
      totalCount: response.totalCount,
      ranking: response.ranking,
      isFallback: false,
    };
  },

  async getFeed(params?: GetRankingFeedWebRequest): Promise<RankingFeedResult> {
    const raw = await apiFetch<GetRankingFeedWebResponse | Record<string, unknown>>(
      RANKING_ENDPOINTS.GET_FEED.path,
      {
        method: RANKING_ENDPOINTS.GET_FEED.method,
        requiresAuth: RANKING_ENDPOINTS.GET_FEED.requiresAuth,
        params,
      },
    );

    if (isFallbackResponse(raw, 'posts')) {
      return {
        posts: [],
        totalCount: 0,
        ranking: null,
        isFallback: true,
      };
    }

    const response = raw as GetRankingFeedWebResponse;
    return {
      posts: response.posts,
      totalCount: response.totalCount,
      ranking: response.ranking,
      isFallback: false,
    };
  },

  async requestRefresh(listKind: RankingListKindWeb): Promise<RequestRankingRefreshWebResponse> {
    return apiFetch<RequestRankingRefreshWebResponse, { listKind: RankingListKindWeb }>(
      RANKING_ENDPOINTS.REQUEST_REFRESH.path,
      {
        method: RANKING_ENDPOINTS.REQUEST_REFRESH.method,
        requiresAuth: RANKING_ENDPOINTS.REQUEST_REFRESH.requiresAuth,
        body: { listKind },
      },
    );
  },

  async updateLocation(lat: number, lng: number): Promise<UpdateUserLocationWebResponse> {
    return apiFetch<UpdateUserLocationWebResponse, { lat: number; lng: number }>(
      RANKING_ENDPOINTS.UPDATE_LOCATION.path,
      {
        method: RANKING_ENDPOINTS.UPDATE_LOCATION.method,
        requiresAuth: RANKING_ENDPOINTS.UPDATE_LOCATION.requiresAuth,
        body: { lat, lng },
      },
    );
  },

  async recordFeedback(eventIds: string[]): Promise<RecordEventFeedbackWebResponse> {
    if (eventIds.length === 0) {
      return { recorded: 0 };
    }
    return apiFetch<
      RecordEventFeedbackWebResponse,
      { items: Array<{ eventId: string; action: 'PASS' }> }
    >(RANKING_ENDPOINTS.RECORD_FEEDBACK.path, {
      method: RANKING_ENDPOINTS.RECORD_FEEDBACK.method,
      requiresAuth: RANKING_ENDPOINTS.RECORD_FEEDBACK.requiresAuth,
      body: {
        items: eventIds.map((eventId) => ({ eventId, action: 'PASS' })),
      },
    });
  },
};
