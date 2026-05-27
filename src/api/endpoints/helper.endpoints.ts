import { UserRoles } from '@volontariapp/shared';
import type { EndpointDefinition } from '../types';

export const HELPER_ENDPOINTS = {
  GET_CHECK_KEY: {
    path: '/helpers/tokens/check-key',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<void, void>,
  GENERATE_ACCESS_TOKEN: {
    path: '/helpers/tokens/access-token',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<UserRoles, void>,
  GENERATE_ADMIN_TOKEN: {
    path: '/helpers/tokens/admin-token',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<void, void>,
  GENERATE_REFRESH_TOKEN: {
    path: '/helpers/tokens/refresh-token',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<UserRoles, void>,
  GENERATE_INTERNAL_TOKEN: {
    path: '/helpers/tokens/internal-token',
    method: 'GET',
    requiresAuth: true,
    roles: [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN],
  } as EndpointDefinition<UserRoles, void>,
} as const;
