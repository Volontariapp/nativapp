import { UserRoles } from '@volontariapp/shared';
import type { EndpointDefinition } from '../types';

const LIVE_ROLES = [UserRoles.ORGANIZATION, UserRoles.VOLUNTEER, UserRoles.ADMIN];

export const LIVE_ENDPOINTS = {
  START_SHARING: {
    path: '/live/events/:eventId/sharing',
    method: 'PUT',
    requiresAuth: true,
    roles: LIVE_ROLES,
  } as EndpointDefinition<void, void>,
  STOP_SHARING: {
    path: '/live/events/:eventId/sharing',
    method: 'DELETE',
    requiresAuth: true,
    roles: LIVE_ROLES,
  } as EndpointDefinition<void, void>,
};
