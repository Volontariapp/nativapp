import type { EndpointDefinition } from '../types';

export const HEALTH_ENDPOINTS = {
  CHECK_HEALTH: {
    path: '/health',
    method: 'GET',
    requiresAuth: false,
  } as EndpointDefinition<void, void>,
} as const;
