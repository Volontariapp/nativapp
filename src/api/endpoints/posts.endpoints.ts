import { UserRoles } from '@volontariapp/shared';
import type { EndpointDefinition } from '../types';
import type {
  CreatePostRequest,
  GetPostResponse,
  UpdatePostRequest,
  ActionSuccessWebResponse,
  ListPostsRequest,
  ListPostsResponse,
} from '@volontariapp/contracts';

export const POST_ENDPOINTS = {
  CREATE_POST: {
    path: '/posts',
    method: 'POST',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<CreatePostRequest, GetPostResponse>,
  UPDATE_POST: {
    path: '/posts/:id',
    method: 'PATCH',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<UpdatePostRequest, GetPostResponse>,
  DELETE_POST: {
    path: '/posts/:id',
    method: 'DELETE',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<void, ActionSuccessWebResponse>,
  GET_POST: {
    path: '/posts/:id',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<void, GetPostResponse>,
  LIST_POSTS: {
    path: '/posts',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<ListPostsRequest, ListPostsResponse>,
} as const;
