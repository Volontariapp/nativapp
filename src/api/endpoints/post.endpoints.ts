import { UserRoles } from '@volontariapp/shared';
import type { EndpointDefinition } from '../types';
import type {
  CreatePostRequest,
  UpdatePostRequest,
  ListPostsRequest,
  PostWebResponse,
  ListPostsWebResponse,
  CreatePostWebResponse,
  ActionSuccessWebResponse,
  CreateCommentRequest,
  CommentWebResponse,
  ListCommentsRequest,
  ListCommentsWebResponse,
} from '@volontariapp/contracts';

export const POST_ENDPOINTS = {
  CREATE_POST: {
    path: '/posts',
    method: 'POST',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<CreatePostRequest, CreatePostWebResponse>,
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
} as const;

export const COMMENT_ENDPOINTS = {
  CREATE_COMMENT: {
    path: '/posts/:postId/comments',
    method: 'POST',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<CreateCommentRequest, CommentWebResponse>,
  DELETE_COMMENT: {
    path: '/posts/:postId/comments/:id',
    method: 'DELETE',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<void, ActionSuccessWebResponse>,
  LIST_COMMENTS: {
    path: '/posts/:postId/comments',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<ListCommentsRequest, ListCommentsWebResponse>,
} as const;
