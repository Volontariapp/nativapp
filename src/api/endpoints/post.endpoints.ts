import { UserRoles } from '@volontariapp/shared';
import type { EndpointDefinition } from '../types';
import type {
  ListPostsRequest,
  ListPostsWebResponse,
  PostWebResponse,
  CreatePostRequest,
  UpdatePostRequest,
  ActionSuccessWebResponse,
} from '@volontariapp/contracts';

export const POST_ENDPOINTS = {
  LIST_POSTS: {
    path: '/posts',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<ListPostsRequest, ListPostsWebResponse>,
  GET_POST: {
    path: '/posts/:id',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<void, PostWebResponse>,
  CREATE_POST: {
    path: '/posts',
    method: 'POST',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<CreatePostRequest, PostWebResponse>,
  UPDATE_POST: {
    path: '/posts/:id',
    method: 'PATCH',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<UpdatePostRequest, PostWebResponse>,
  DELETE_POST: {
    path: '/posts/:id',
    method: 'DELETE',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<void, ActionSuccessWebResponse>,
} as const;
