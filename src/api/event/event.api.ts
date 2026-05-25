import { apiFetch } from '../client';
import { EVENT_ENDPOINTS } from '../endpoints';
import type {
  CreateEventRequest,
  EventType,
  EventState,
  CreateEventResponse,
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
    const response = await apiFetch<CreateEventResponse, CreateEventRequest>(
      EVENT_ENDPOINTS.CREATE.path,
      {
        method: EVENT_ENDPOINTS.CREATE.method,
        requiresAuth: EVENT_ENDPOINTS.CREATE.requiresAuth,
        body: payload,
      },
    );

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
    };
  },
};
