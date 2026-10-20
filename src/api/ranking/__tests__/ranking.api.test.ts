import { apiFetch } from '../../client';
import { rankingApi } from '../ranking.api';
import { RANKING_ENDPOINTS } from '../../endpoints/ranking.endpoints';
import { EventState, EventType, type GetRankingEventsWebResponse } from '@volontariapp/contracts';

jest.mock('../../client', () => ({
  apiFetch: jest.fn(),
}));

const apiFetchMock = jest.mocked(apiFetch);

describe('rankingApi', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getEvents', () => {
    it('returns ranked events with scores, reasons and meta when backend succeeds', async () => {
      const mockResponse: GetRankingEventsWebResponse = {
        events: [
          {
            id: 'evt-1',
            title: 'Nettoyage des berges',
            description: 'Action collective',
            localisationName: 'Lyon',
            type: EventType.EVENT_TYPE_ECOLOGY,
            state: EventState.EVENT_STATE_PUBLISHED,
            awardedImpactScore: 15,
            maxParticipants: 20,
            currentParticipants: 5,
            tags: [],
            requirements: [],
            coverStatus: 'NONE',
            location: undefined,
            rankingScore: 88.5,
            reasons: ['NEAR_YOU', 'MATCHES_INTERESTS'],
          },
        ],
        totalCount: 1,
        ranking: {
          source: 'FULL',
          computedAt: '2026-10-20T08:00:00.000Z',
          stale: false,
          hasMore: false,
          versionChanged: false,
          listVersion: 'v123',
          nextCursor: '',
        },
      };

      apiFetchMock.mockResolvedValue(mockResponse);

      const result = await rankingApi.getEvents({ limit: 20 });

      expect(apiFetchMock).toHaveBeenCalledWith(RANKING_ENDPOINTS.GET_EVENTS.path, {
        method: RANKING_ENDPOINTS.GET_EVENTS.method,
        requiresAuth: RANKING_ENDPOINTS.GET_EVENTS.requiresAuth,
        params: { limit: 20 },
      });

      expect(result.isFallback).toBe(false);
      if (!result.isFallback) {
        expect(result.events).toHaveLength(1);
        expect(result.events[0]?.id).toBe('evt-1');
        expect(result.events[0]?.rankingScore).toBe(88.5);
        expect(result.events[0]?.reasons).toEqual(['NEAR_YOU', 'MATCHES_INTERESTS']);
        expect(result.ranking.source).toBe('FULL');
      }
    });

    it('detects 206 FALLBACK_ACTIVATED and returns isFallback = true', async () => {
      apiFetchMock.mockResolvedValue({
        code: 'FALLBACK_ACTIVATED',
        message: 'Ranking not ready yet',
      });

      const result = await rankingApi.getEvents({ limit: 10 });

      expect(result.isFallback).toBe(true);
      expect(result.events).toEqual([]);
      expect(result.ranking).toBeNull();
      expect(result.totalCount).toBe(0);
    });

    it('returns fallback if response does not contain events array', async () => {
      apiFetchMock.mockResolvedValue({ someUnexpectedField: true });

      const result = await rankingApi.getEvents();

      expect(result.isFallback).toBe(true);
      expect(result.events).toEqual([]);
      expect(result.ranking).toBeNull();
    });
  });

  describe('getFeed', () => {
    it('returns ranked posts with scores, reasons and meta when backend succeeds', async () => {
      apiFetchMock.mockResolvedValue({
        posts: [
          {
            id: 'post-1',
            title: 'Premier post',
            content: 'Super action aujourdhui',
            authorId: 'user-1',
            createdAt: '2026-10-20T08:00:00.000Z',
            likes: 12,
            commentsCount: 3,
            files: [],
            rankingScore: 92.4,
            reasons: ['FOLLOWED_AUTHOR', 'TRENDING'],
          },
        ],
        totalCount: 1,
        ranking: {
          source: 'FULL',
          computedAt: '2026-10-20T08:00:00.000Z',
          stale: false,
          hasMore: false,
          versionChanged: false,
          listVersion: 'feed-v1',
          nextCursor: '',
        },
      });

      const result = await rankingApi.getFeed({ limit: 10 });

      expect(apiFetchMock).toHaveBeenCalledWith(RANKING_ENDPOINTS.GET_FEED.path, {
        method: RANKING_ENDPOINTS.GET_FEED.method,
        requiresAuth: RANKING_ENDPOINTS.GET_FEED.requiresAuth,
        params: { limit: 10 },
      });

      expect(result.isFallback).toBe(false);
      if (!result.isFallback) {
        expect(result.posts).toHaveLength(1);
        expect(result.posts[0]?.id).toBe('post-1');
        expect(result.posts[0]?.rankingScore).toBe(92.4);
        expect(result.posts[0]?.reasons).toEqual(['FOLLOWED_AUTHOR', 'TRENDING']);
        expect(result.ranking.source).toBe('FULL');
      }
    });

    it('detects 206 FALLBACK_ACTIVATED on getFeed and returns isFallback = true', async () => {
      apiFetchMock.mockResolvedValue({
        code: 'FALLBACK_ACTIVATED',
        message: 'Feed ranking not ready yet',
      });

      const result = await rankingApi.getFeed({ limit: 10 });

      expect(result.isFallback).toBe(true);
      expect(result.posts).toEqual([]);
      expect(result.ranking).toBeNull();
      expect(result.totalCount).toBe(0);
    });

    it('returns fallback if response does not contain posts array', async () => {
      apiFetchMock.mockResolvedValue({ someUnexpectedField: true });

      const result = await rankingApi.getFeed();

      expect(result.isFallback).toBe(true);
      expect(result.posts).toEqual([]);
      expect(result.ranking).toBeNull();
    });
  });

  describe('requestRefresh', () => {
    it('calls POST /ranking/refresh with listKind', async () => {
      apiFetchMock.mockResolvedValue({
        accepted: true,
        refreshThrottled: false,
      });

      const result = await rankingApi.requestRefresh('EVENT');

      expect(apiFetchMock).toHaveBeenCalledWith(RANKING_ENDPOINTS.REQUEST_REFRESH.path, {
        method: RANKING_ENDPOINTS.REQUEST_REFRESH.method,
        requiresAuth: RANKING_ENDPOINTS.REQUEST_REFRESH.requiresAuth,
        body: { listKind: 'EVENT' },
      });

      expect(result.accepted).toBe(true);
      expect(result.refreshThrottled).toBe(false);
    });
  });

  describe('updateLocation', () => {
    it('calls PUT /ranking/location with coordinates without rounding', async () => {
      apiFetchMock.mockResolvedValue({
        accepted: true,
      });

      const result = await rankingApi.updateLocation(48.856612, 2.352222);

      expect(apiFetchMock).toHaveBeenCalledWith(RANKING_ENDPOINTS.UPDATE_LOCATION.path, {
        method: RANKING_ENDPOINTS.UPDATE_LOCATION.method,
        requiresAuth: RANKING_ENDPOINTS.UPDATE_LOCATION.requiresAuth,
        body: { lat: 48.856612, lng: 2.352222 },
      });

      expect(result.accepted).toBe(true);
    });
  });

  describe('recordFeedback', () => {
    it('does not call apiFetch if eventIds is empty', async () => {
      const result = await rankingApi.recordFeedback([]);

      expect(apiFetchMock).not.toHaveBeenCalled();
      expect(result.recorded).toBe(0);
    });

    it('calls POST /ranking/events/feedback with batch items', async () => {
      apiFetchMock.mockResolvedValue({ recorded: 2 });

      const result = await rankingApi.recordFeedback(['evt-1', 'evt-2']);

      expect(apiFetchMock).toHaveBeenCalledWith(RANKING_ENDPOINTS.RECORD_FEEDBACK.path, {
        method: RANKING_ENDPOINTS.RECORD_FEEDBACK.method,
        requiresAuth: RANKING_ENDPOINTS.RECORD_FEEDBACK.requiresAuth,
        body: {
          items: [
            { eventId: 'evt-1', action: 'PASS' },
            { eventId: 'evt-2', action: 'PASS' },
          ],
        },
      });

      expect(result.recorded).toBe(2);
    });
  });
});
