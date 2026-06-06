import { apiFetch } from '../client';
import { EVENT_ENDPOINTS } from '../endpoints';
import type {
  CreateEventRequest,
  EventType,
  EventState,
  CreateEventResponse,
  SearchEventsResponse,
} from '@volontariapp/contracts';

export interface AppEvent {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  localisationName: string;
  type: EventType;
  state: EventState;
  awardedImpactScore: number;
  maxParticipants: number;
  currentParticipants: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface GrpcTimestamp {
  seconds: number | string;
  nanos?: number;
}

// TODO: doit être fait dans le backend dans l'apigateway
const formatTimestamp = (ts: GrpcTimestamp | string | undefined | null): string => {
  if (ts === null || ts === undefined) return new Date().toISOString();
  if (typeof ts === 'string') return ts;
  if (typeof ts === 'object' && 'seconds' in ts) {
    const seconds = Number(ts.seconds);
    return new Date(seconds * 1000).toISOString();
  }
  return new Date(ts).toISOString();
};

export const eventApi = {
  async createEvent(payload: CreateEventRequest): Promise<AppEvent> {
    try {
      console.log('[eventApi.createEvent] Sending payload:', payload);
      const response = await apiFetch<CreateEventResponse, CreateEventRequest>(
        EVENT_ENDPOINTS.CREATE_EVENT.path,
        {
          method: EVENT_ENDPOINTS.CREATE_EVENT.method,
          requiresAuth: EVENT_ENDPOINTS.CREATE_EVENT.requiresAuth,
          body: payload,
        },
      );

      console.log('[eventApi.createEvent] Received response:', response);

      if (response.event === undefined) {
        throw new Error('Event data not found');
      }

      return {
        id: response.event.id,
        title: response.event.title,
        description: response.event.description,
        startAt: formatTimestamp(response.event.startAt),
        endAt: formatTimestamp(response.event.endAt),
        localisationName: response.event.localisationName,
        type: response.event.type,
        state: response.event.state,
        awardedImpactScore: response.event.awardedImpactScore,
        maxParticipants: response.event.maxParticipants,
        currentParticipants: response.event.currentParticipants,
        location: response.event.location
          ? {
              latitude: response.event.location.latitude,
              longitude: response.event.location.longitude,
            }
          : undefined,
      };
    } catch (error) {
      console.error('[eventApi.createEvent] Error details:', error);
      throw error;
    }
  },

  async getMyEvents(params: {
    page?: number;
    limit?: number;
  }): Promise<{ events: AppEvent[]; totalCount: number }> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const path = queryString
      ? `${EVENT_ENDPOINTS.GET_USER_CREATED_EVENTS_SELF.path}?${queryString}`
      : EVENT_ENDPOINTS.GET_USER_CREATED_EVENTS_SELF.path;

    const response = await apiFetch<SearchEventsResponse>(path, {
      method: EVENT_ENDPOINTS.GET_USER_CREATED_EVENTS_SELF.method,
      requiresAuth: EVENT_ENDPOINTS.GET_USER_CREATED_EVENTS_SELF.requiresAuth,
    });

    return {
      events: response.events.map((ev) => ({
        id: ev.id,
        title: ev.title,
        description: ev.description,
        startAt: formatTimestamp(ev.startAt),
        endAt: formatTimestamp(ev.endAt),
        localisationName: ev.localisationName,
        type: ev.type,
        state: ev.state,
        awardedImpactScore: ev.awardedImpactScore,
        maxParticipants: ev.maxParticipants,
        currentParticipants: ev.currentParticipants,
        location: ev.location
          ? {
              latitude: ev.location.latitude,
              longitude: ev.location.longitude,
            }
          : undefined,
      })),
      totalCount: response.totalCount,
    };
  },
};
