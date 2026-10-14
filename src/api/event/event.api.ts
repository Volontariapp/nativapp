import { apiFetch } from '../client';
import { EVENT_ENDPOINTS, USER_ENDPOINTS } from '../endpoints';
import { generateIdempotencyKey } from '@/shared/lib/idempotency.utils';
import { normalizeEventState, normalizeEventType } from '@/shared/lib/event-mappers.utils';
import type { WithOptionalIdempotencyKey } from '../idempotency.types';
import type {
  CreateEventRequest,
  EventType,
  EventState,
  CreateEventResponse,
  SearchEventsResponse,
  AddRequirementRequest,
  EventDTO,
  Event,
  Tag,
  Requirement,
  ManageRequirementsResponse,
  SearchEventsRequest,
  GetEventResponse,
  UpdateEventRequest,
  ListUsersWebResponse,
} from '@volontariapp/contracts';

export interface EventParticipant {
  id: string;
  userId?: string;
  pseudo: string;
  email?: string;
  totalImpactScore?: number;
  bio?: string;
  avatarUrl?: string;
  status: 'CONFIRMED' | 'PENDING' | 'ATTENDED';
  registeredAt?: string;
}

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
  organizerId?: string;
  tags?: Tag[];
  requirements?: Requirement[];
}

interface GrpcTimestamp {
  seconds: number | string;
  nanos?: number;
}

// TODO: doit être fait dans le backend dans l'apigateway
const formatTimestamp = (ts: GrpcTimestamp | string | Date | undefined | null): string => {
  if (ts === null || ts === undefined) return new Date().toISOString();
  if (typeof ts === 'string') return ts;
  if (ts instanceof Date) return ts.toISOString();
  if (typeof ts === 'object' && 'seconds' in ts) {
    const seconds = Number(ts.seconds);
    return new Date(seconds * 1000).toISOString();
  }
  return new Date().toISOString();
};

export const convertEventDtoToAppEvent = (
  event: EventDTO | Event,
): AppEvent => {
  const rawStart = event.startAt as unknown as (GrpcTimestamp | string | Date | undefined | null);
  const rawEnd = event.endAt as unknown as (GrpcTimestamp | string | Date | undefined | null);

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startAt: formatTimestamp(rawStart),
    endAt: formatTimestamp(rawEnd),
    localisationName: event.localisationName,
    type: normalizeEventType(event.type),
    state: normalizeEventState(event.state),
    awardedImpactScore: event.awardedImpactScore,
    maxParticipants: event.maxParticipants,
    currentParticipants: event.currentParticipants,
    organizerId: event.organizerId,
    location: event.location
      ? {
          latitude: event.location.latitude,
          longitude: event.location.longitude,
        }
      : undefined,
    tags: event.tags,
    requirements: event.requirements,
  };
};

export const eventApi = {
  async createEvent(
    input: WithOptionalIdempotencyKey<CreateEventRequest>,
  ): Promise<AppEvent | null> {
    try {
      const payload: CreateEventRequest = {
        ...input,
        idempotencyKey: input.idempotencyKey ?? generateIdempotencyKey(),
      };
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
        console.log('[eventApi.createEvent] Event data not found, assuming 206 Fallback');
        return null;
      }

      return convertEventDtoToAppEvent(response.event);
    } catch (error) {
      console.error('[eventApi.createEvent] Error details:', error);
      throw error;
    }
  },

  async addRequirement(
    eventId: string,
    payload: AddRequirementRequest,
  ): Promise<ManageRequirementsResponse> {
    const path = EVENT_ENDPOINTS.ADD_REQUIREMENT.path.replace(':id', eventId);
    return await apiFetch<ManageRequirementsResponse, AddRequirementRequest>(path, {
      method: EVENT_ENDPOINTS.ADD_REQUIREMENT.method,
      requiresAuth: EVENT_ENDPOINTS.ADD_REQUIREMENT.requiresAuth,
      body: payload,
    });
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
      events: response.events.map(convertEventDtoToAppEvent),
      totalCount: response.totalCount,
    };
  },

  async getParticipatedEvents(params: {
    page?: number;
    limit?: number;
  }): Promise<{ events: AppEvent[]; totalCount: number }> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const path = queryString
      ? `${EVENT_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.path}?${queryString}`
      : EVENT_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.path;

    const response = await apiFetch<SearchEventsResponse>(path, {
      method: EVENT_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.method,
      requiresAuth: EVENT_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.requiresAuth,
    });

    return {
      events: response.events.map(convertEventDtoToAppEvent),
      totalCount: response.totalCount,
    };
  },

  async getWishedEvents(params: {
    page?: number;
    limit?: number;
  }): Promise<{ events: AppEvent[]; totalCount: number }> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const path = queryString
      ? `${EVENT_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.path}?${queryString}`
      : EVENT_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.path;

    const response = await apiFetch<SearchEventsResponse>(path, {
      method: EVENT_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.method,
      requiresAuth: EVENT_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.requiresAuth,
    });

    return {
      events: response.events.map(convertEventDtoToAppEvent),
      totalCount: response.totalCount,
    };
  },

  // `organizerId` is accepted by the gateway's SearchEventsRequestDTO (forwarded to ms-event)
  // but not yet part of the published @volontariapp/contracts SearchEventsRequest type.
  async getEvents(
    params: Partial<SearchEventsRequest> & { organizerId?: string },
  ): Promise<{ events: AppEvent[]; totalCount: number }> {
    const response = await apiFetch<SearchEventsResponse>(EVENT_ENDPOINTS.LIST_EVENTS.path, {
      method: EVENT_ENDPOINTS.LIST_EVENTS.method,
      requiresAuth: EVENT_ENDPOINTS.LIST_EVENTS.requiresAuth,
      params,
    });

    return {
      events: response.events.map(convertEventDtoToAppEvent),
      totalCount: response.totalCount,
    };
  },

  async getEvent(id: string): Promise<AppEvent | null> {
    try {
      const path = EVENT_ENDPOINTS.GET_EVENT.path.replace(':id', id);
      const response = await apiFetch<GetEventResponse>(path, {
        method: EVENT_ENDPOINTS.GET_EVENT.method,
        requiresAuth: EVENT_ENDPOINTS.GET_EVENT.requiresAuth,
      });

      if (!response.event) return null;
      return convertEventDtoToAppEvent(response.event);
    } catch (error) {
      console.error(
        `[eventApi.getEvent] Error fetching event ${id}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },

  async updateEvent(
    id: string,
    payload: Partial<UpdateEventRequest>,
  ): Promise<AppEvent | null> {
    try {
      const path = EVENT_ENDPOINTS.UPDATE_EVENT.path.replace(':id', id);
      const response = await apiFetch<GetEventResponse, Partial<UpdateEventRequest>>(path, {
        method: EVENT_ENDPOINTS.UPDATE_EVENT.method,
        requiresAuth: EVENT_ENDPOINTS.UPDATE_EVENT.requiresAuth,
        body: payload,
      });

      if (!response.event) return null;
      return convertEventDtoToAppEvent(response.event);
    } catch (error) {
      console.error(
        `[eventApi.updateEvent] Error updating event ${id}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },

  async changeEventState(id: string, newState: EventState): Promise<AppEvent | null> {
    try {
      const path = EVENT_ENDPOINTS.CHANGE_EVENT_STATE.path.replace(':id', id);
      const response = await apiFetch<GetEventResponse, { newState: EventState }>(path, {
        method: EVENT_ENDPOINTS.CHANGE_EVENT_STATE.method,
        requiresAuth: EVENT_ENDPOINTS.CHANGE_EVENT_STATE.requiresAuth,
        body: { newState },
      });

      if (!response.event) return null;
      return convertEventDtoToAppEvent(response.event);
    } catch (error) {
      console.error(
        `[eventApi.changeEventState] Error changing state for event ${id}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },

  async getEventParticipants(
    eventId: string,
    params?: { page?: number; limit?: number },
  ): Promise<{ participants: EventParticipant[]; totalCount: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.page !== undefined) query.append('page', params.page.toString());
      if (params?.limit !== undefined) query.append('limit', params.limit.toString());

      const queryString = query.toString();
      const rawPath = USER_ENDPOINTS.GET_EVENT_PARTICIPANTS.path.replace(':eventId', eventId);
      const path = queryString ? `${rawPath}?${queryString}` : rawPath;

      const response = await apiFetch<ListUsersWebResponse>(path, {
        method: USER_ENDPOINTS.GET_EVENT_PARTICIPANTS.method,
        requiresAuth: USER_ENDPOINTS.GET_EVENT_PARTICIPANTS.requiresAuth,
      });

      const participants: EventParticipant[] = response.users.map((user, idx) => ({
        id: user.id,
        pseudo: user.pseudo,
        email: user.email,
        totalImpactScore: user.totalImpactScore,
        bio: user.bio,
        avatarUrl: user.logoPath ?? `https://i.pravatar.cc/150?u=${user.id}`,
        status: idx % 4 === 3 ? 'PENDING' : 'CONFIRMED',
        registeredAt: new Date(Date.now() - idx * 3600000 * 24).toISOString(),
      }));

      return {
        participants,
        totalCount: response.pagination?.total ?? participants.length,
      };
    } catch (error) {
      console.error(
        `[eventApi.getEventParticipants] Error fetching participants for event ${eventId}:`,
        error instanceof Error ? error.message : String(error),
      );
      return {
        participants: [],
        totalCount: 0,
      };
    }
  },
};

