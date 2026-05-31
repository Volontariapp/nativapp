import { apiFetch } from '../client';
import { EVENT_ENDPOINTS } from '../endpoints/event.endpoints';
import type {
  CreateEventRequest,
  GetEventResponse,
  UpdateEventRequest,
  ChangeEventStateRequest,
  AddRequirementRequest,
  ManageRequirementsResponse,
  ActionSuccessWebResponse,
  CreateTagRequest,
  CreateTagResponse,
  UpdateTagRequest,
  UpdateTagResponse,
  SearchEventsRequest,
  SearchEventsResponse,
  ListRequirementsWebResponse,
  GetTagsRequest,
  GetTagsResponse,
} from '@volontariapp/contracts';
import type {
  GetUserEventsRequest,
  GetUserParticipationsRequest,
  GetUserWishesRequest,
} from '../endpoints/types/missing-types';

export const adminEventApi = {
  async createEvent(
    payload: CreateEventRequest,
    pathParams?: Record<string, string>,
  ): Promise<GetEventResponse> {
    let finalPath: string = EVENT_ENDPOINTS.CREATE_EVENT.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<GetEventResponse, CreateEventRequest>(finalPath, {
      method: EVENT_ENDPOINTS.CREATE_EVENT.method,
      requiresAuth: EVENT_ENDPOINTS.CREATE_EVENT.requiresAuth,
      body: EVENT_ENDPOINTS.CREATE_EVENT.method !== 'GET' ? payload : undefined,
    });
  },

  async updateEvent(
    payload: UpdateEventRequest,
    pathParams?: Record<string, string>,
  ): Promise<GetEventResponse> {
    let finalPath: string = EVENT_ENDPOINTS.UPDATE_EVENT.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<GetEventResponse, UpdateEventRequest>(finalPath, {
      method: EVENT_ENDPOINTS.UPDATE_EVENT.method,
      requiresAuth: EVENT_ENDPOINTS.UPDATE_EVENT.requiresAuth,
      body: EVENT_ENDPOINTS.UPDATE_EVENT.method !== 'GET' ? payload : undefined,
    });
  },

  async changeEventState(
    payload: ChangeEventStateRequest,
    pathParams?: Record<string, string>,
  ): Promise<GetEventResponse> {
    let finalPath: string = EVENT_ENDPOINTS.CHANGE_EVENT_STATE.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<GetEventResponse, ChangeEventStateRequest>(finalPath, {
      method: EVENT_ENDPOINTS.CHANGE_EVENT_STATE.method,
      requiresAuth: EVENT_ENDPOINTS.CHANGE_EVENT_STATE.requiresAuth,
      body: EVENT_ENDPOINTS.CHANGE_EVENT_STATE.method !== 'GET' ? payload : undefined,
    });
  },

  async addRequirement(
    payload: AddRequirementRequest,
    pathParams?: Record<string, string>,
  ): Promise<ManageRequirementsResponse> {
    let finalPath: string = EVENT_ENDPOINTS.ADD_REQUIREMENT.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ManageRequirementsResponse, AddRequirementRequest>(finalPath, {
      method: EVENT_ENDPOINTS.ADD_REQUIREMENT.method,
      requiresAuth: EVENT_ENDPOINTS.ADD_REQUIREMENT.requiresAuth,
      body: EVENT_ENDPOINTS.ADD_REQUIREMENT.method !== 'GET' ? payload : undefined,
    });
  },

  async removeRequirement(
    pathParams?: Record<string, string>,
  ): Promise<ManageRequirementsResponse> {
    let finalPath: string = EVENT_ENDPOINTS.REMOVE_REQUIREMENT.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ManageRequirementsResponse>(finalPath, {
      method: EVENT_ENDPOINTS.REMOVE_REQUIREMENT.method,
      requiresAuth: EVENT_ENDPOINTS.REMOVE_REQUIREMENT.requiresAuth,
    });
  },

  async deleteEvent(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = EVENT_ENDPOINTS.DELETE_EVENT.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: EVENT_ENDPOINTS.DELETE_EVENT.method,
      requiresAuth: EVENT_ENDPOINTS.DELETE_EVENT.requiresAuth,
    });
  },

  async createTag(
    payload: CreateTagRequest,
    pathParams?: Record<string, string>,
  ): Promise<CreateTagResponse> {
    let finalPath: string = EVENT_ENDPOINTS.CREATE_TAG.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<CreateTagResponse, CreateTagRequest>(finalPath, {
      method: EVENT_ENDPOINTS.CREATE_TAG.method,
      requiresAuth: EVENT_ENDPOINTS.CREATE_TAG.requiresAuth,
      body: EVENT_ENDPOINTS.CREATE_TAG.method !== 'GET' ? payload : undefined,
    });
  },

  async updateTag(
    payload: UpdateTagRequest,
    pathParams?: Record<string, string>,
  ): Promise<UpdateTagResponse> {
    let finalPath: string = EVENT_ENDPOINTS.UPDATE_TAG.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<UpdateTagResponse, UpdateTagRequest>(finalPath, {
      method: EVENT_ENDPOINTS.UPDATE_TAG.method,
      requiresAuth: EVENT_ENDPOINTS.UPDATE_TAG.requiresAuth,
      body: EVENT_ENDPOINTS.UPDATE_TAG.method !== 'GET' ? payload : undefined,
    });
  },

  async deleteTag(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = EVENT_ENDPOINTS.DELETE_TAG.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: EVENT_ENDPOINTS.DELETE_TAG.method,
      requiresAuth: EVENT_ENDPOINTS.DELETE_TAG.requiresAuth,
    });
  },

  async listEvents(
    payload: SearchEventsRequest,
    pathParams?: Record<string, string>,
  ): Promise<SearchEventsResponse> {
    let finalPath: string = EVENT_ENDPOINTS.LIST_EVENTS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    const queryParts: string[] = ['page=1', 'limit=50'];
    if (payload.onlyAvailable !== undefined) {
      queryParts.push('onlyAvailable=' + String(payload.onlyAvailable));
    }
    if (payload.searchTerm != null && payload.searchTerm !== '') {
      queryParts.push(`searchTerm=${encodeURIComponent(payload.searchTerm)}`);
    }
    if (payload.organizerId != null && payload.organizerId !== '') {
      queryParts.push(`organizerId=${encodeURIComponent(payload.organizerId)}`);
    }
    const query = queryParts.join('&');
    if (query !== '') {
      finalPath += `?${query}`;
    }
    return apiFetch<SearchEventsResponse, SearchEventsRequest>(finalPath, {
      method: EVENT_ENDPOINTS.LIST_EVENTS.method,
      requiresAuth: EVENT_ENDPOINTS.LIST_EVENTS.requiresAuth,
    });
  },

  async getEvent(pathParams?: Record<string, string>): Promise<GetEventResponse> {
    let finalPath: string = EVENT_ENDPOINTS.GET_EVENT.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<GetEventResponse>(finalPath, {
      method: EVENT_ENDPOINTS.GET_EVENT.method,
      requiresAuth: EVENT_ENDPOINTS.GET_EVENT.requiresAuth,
    });
  },

  async listRequirements(
    pathParams?: Record<string, string>,
  ): Promise<ListRequirementsWebResponse> {
    let finalPath: string = EVENT_ENDPOINTS.LIST_REQUIREMENTS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ListRequirementsWebResponse>(finalPath, {
      method: EVENT_ENDPOINTS.LIST_REQUIREMENTS.method,
      requiresAuth: EVENT_ENDPOINTS.LIST_REQUIREMENTS.requiresAuth,
    });
  },

  async getUserCreatedEventsSelf(
    payload: GetUserEventsRequest,
    pathParams?: Record<string, string>,
  ): Promise<SearchEventsResponse> {
    let finalPath: string = EVENT_ENDPOINTS.GET_USER_CREATED_EVENTS_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<SearchEventsResponse, GetUserEventsRequest>(finalPath, {
      method: EVENT_ENDPOINTS.GET_USER_CREATED_EVENTS_SELF.method,
      requiresAuth: EVENT_ENDPOINTS.GET_USER_CREATED_EVENTS_SELF.requiresAuth,
      body: EVENT_ENDPOINTS.GET_USER_CREATED_EVENTS_SELF.method !== 'GET' ? payload : undefined,
    });
  },

  async getUserParticipatedEventsSelf(
    payload: GetUserParticipationsRequest,
    pathParams?: Record<string, string>,
  ): Promise<SearchEventsResponse> {
    let finalPath: string = EVENT_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<SearchEventsResponse, GetUserParticipationsRequest>(finalPath, {
      method: EVENT_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.method,
      requiresAuth: EVENT_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.requiresAuth,
      body:
        EVENT_ENDPOINTS.GET_USER_PARTICIPATED_EVENTS_SELF.method !== 'GET' ? payload : undefined,
    });
  },

  async getUserWishedEventsSelf(
    payload: GetUserWishesRequest,
    pathParams?: Record<string, string>,
  ): Promise<SearchEventsResponse> {
    let finalPath: string = EVENT_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<SearchEventsResponse, GetUserWishesRequest>(finalPath, {
      method: EVENT_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.method,
      requiresAuth: EVENT_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.requiresAuth,
      body: EVENT_ENDPOINTS.GET_USER_WISHED_EVENTS_SELF.method !== 'GET' ? payload : undefined,
    });
  },

  async listTags(
    payload: GetTagsRequest,
    pathParams?: Record<string, string>,
  ): Promise<GetTagsResponse> {
    let finalPath: string = EVENT_ENDPOINTS.LIST_TAGS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<GetTagsResponse, GetTagsRequest>(finalPath, {
      method: EVENT_ENDPOINTS.LIST_TAGS.method,
      requiresAuth: EVENT_ENDPOINTS.LIST_TAGS.requiresAuth,
      body: EVENT_ENDPOINTS.LIST_TAGS.method !== 'GET' ? payload : undefined,
    });
  },
};
