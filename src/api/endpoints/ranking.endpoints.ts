import { UserRoles } from '@volontariapp/shared';
import type { EndpointDefinition } from '../types';
import type {
  GetRankingEventsWebRequest,
  GetRankingEventsWebResponse,
  GetRankingFeedWebRequest,
  GetRankingFeedWebResponse,
  RequestRankingRefreshWebRequest,
  RequestRankingRefreshWebResponse,
  UpdateUserLocationWebRequest,
  UpdateUserLocationWebResponse,
  RecordEventFeedbackWebRequest,
  RecordEventFeedbackWebResponse,
} from '@volontariapp/contracts';

const RANKING_ROLES = [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN];

export const RANKING_ENDPOINTS = {
  GET_EVENTS: {
    path: '/ranking/events',
    method: 'GET',
    requiresAuth: true,
    roles: RANKING_ROLES,
  } as EndpointDefinition<GetRankingEventsWebRequest, GetRankingEventsWebResponse>,
  GET_FEED: {
    path: '/ranking/feed',
    method: 'GET',
    requiresAuth: true,
    roles: RANKING_ROLES,
  } as EndpointDefinition<GetRankingFeedWebRequest, GetRankingFeedWebResponse>,
  REQUEST_REFRESH: {
    path: '/ranking/refresh',
    method: 'POST',
    requiresAuth: true,
    roles: RANKING_ROLES,
  } as EndpointDefinition<RequestRankingRefreshWebRequest, RequestRankingRefreshWebResponse>,
  UPDATE_LOCATION: {
    path: '/ranking/location',
    method: 'PUT',
    requiresAuth: true,
    roles: RANKING_ROLES,
  } as EndpointDefinition<UpdateUserLocationWebRequest, UpdateUserLocationWebResponse>,
  RECORD_FEEDBACK: {
    path: '/ranking/events/feedback',
    method: 'POST',
    requiresAuth: true,
    roles: RANKING_ROLES,
  } as EndpointDefinition<RecordEventFeedbackWebRequest, RecordEventFeedbackWebResponse>,
};
