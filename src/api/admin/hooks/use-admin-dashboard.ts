import { useQuery } from '@tanstack/react-query';
import { adminUserApi } from '../admin.user.api';
import { adminEventApi } from '../admin.event.api';
import { adminHealthApi } from '../admin.health.api';
import type { ListUsersWebResponse, SearchEventsResponse } from '@volontariapp/contracts';
import { ADMIN_USERS_COUNT_QUERY_KEY } from './use-admin-users';
import { ADMIN_EVENTS_COUNT_QUERY_KEY } from './use-admin-events';

const ADMIN_HEALTH_QUERY_KEY = ['admin', 'health'] as const;

export const useAdminDashboard = () => {
  const usersQuery = useQuery<ListUsersWebResponse>({
    queryKey: ADMIN_USERS_COUNT_QUERY_KEY,
    queryFn: async () => await adminUserApi.listUsers({ pagination: { page: 1, limit: 10 } }),
  });

  const eventsQuery = useQuery<SearchEventsResponse>({
    queryKey: ADMIN_EVENTS_COUNT_QUERY_KEY,
    queryFn: async () => await adminEventApi.listEvents({ onlyAvailable: false }),
  });

  const healthQuery = useQuery({
    queryKey: ADMIN_HEALTH_QUERY_KEY,
    queryFn: async () => {
      await adminHealthApi.checkHealth();
      return true;
    },
  });

  const usersCount = usersQuery.data?.pagination?.total ?? usersQuery.data?.users.length ?? 0;
  const eventsCount = eventsQuery.data?.totalCount ?? eventsQuery.data?.events.length ?? 0;

  return {
    usersCount,
    eventsCount,
    usersError: usersQuery.error,
    eventsError: eventsQuery.error,
    isHealthOk: healthQuery.isSuccess,
  };
};
