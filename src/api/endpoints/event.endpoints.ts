import { UserRoles } from '@volontariapp/shared';
import type { EndpointDefinition } from '../types';
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
} from './types/missing-types';

export const EVENT_ENDPOINTS = {
  CREATE_EVENT: {
    path: '/events',
    method: 'POST',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<CreateEventRequest, GetEventResponse>,
  UPDATE_EVENT: {
    path: '/events/:id',
    method: 'PATCH',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<UpdateEventRequest, GetEventResponse>,
  CHANGE_EVENT_STATE: {
    path: '/events/:id/state',
    method: 'PATCH',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<ChangeEventStateRequest, GetEventResponse>,
  ADD_REQUIREMENT: {
    path: '/events/:id/requirements',
    method: 'POST',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<AddRequirementRequest, ManageRequirementsResponse>,
  REMOVE_REQUIREMENT: {
    path: '/events/:id/requirements/:requirementId',
    method: 'DELETE',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<void, ManageRequirementsResponse>,
  DELETE_EVENT: {
    path: '/events/:id',
    method: 'DELETE',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<void, ActionSuccessWebResponse>,
  CREATE_TAG: {
    path: '/tags',
    method: 'POST',
    requiresAuth: true,
    roles: [UserRoles.ADMIN],
  } as EndpointDefinition<CreateTagRequest, CreateTagResponse>,
  UPDATE_TAG: {
    path: '/tags/:id',
    method: 'PATCH',
    requiresAuth: true,
    roles: [UserRoles.ADMIN],
  } as EndpointDefinition<UpdateTagRequest, UpdateTagResponse>,
  DELETE_TAG: {
    path: '/tags/:id',
    method: 'DELETE',
    requiresAuth: true,
    roles: [UserRoles.ADMIN],
  } as EndpointDefinition<void, ActionSuccessWebResponse>,
  LIST_EVENTS: {
    path: '/events',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<SearchEventsRequest, SearchEventsResponse>,
  GET_EVENT: {
    path: '/events/:id',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<void, GetEventResponse>,
  LIST_REQUIREMENTS: {
    path: '/events/:id/requirements',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<void, ListRequirementsWebResponse>,
  GET_USER_CREATED_EVENTS_SELF: {
    path: '/events/created/me',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<GetUserEventsRequest, SearchEventsResponse>,
  GET_USER_PARTICIPATED_EVENTS_SELF: {
    path: '/events/participated/me',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<GetUserParticipationsRequest, SearchEventsResponse>,
  GET_USER_WISHED_EVENTS_SELF: {
    path: '/events/wished/me',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<GetUserWishesRequest, SearchEventsResponse>,
  LIST_TAGS: {
    path: '/tags',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<GetTagsRequest, GetTagsResponse>,
} as const;
