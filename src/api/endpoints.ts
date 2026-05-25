export const AUTH_ENDPOINTS = {
  REGISTER: {
    path: '/users',
    method: 'POST' as const,
    requiresAuth: false,
  },
  LOGIN: {
    path: '/users/login',
    method: 'POST' as const,
    requiresAuth: false,
  },
} as const;

export const USER_ENDPOINTS = {
  GET_ME: {
    path: '/users/me',
    method: 'GET' as const,
    requiresAuth: true,
  },
} as const;

export const EVENT_ENDPOINTS = {
  CREATE: {
    path: '/events',
    method: 'POST' as const,
    requiresAuth: true,
  },
} as const;
