import { useQuery } from '@tanstack/react-query';
import { adminUserApi } from '../admin.user.api';
import { adminEventApi } from '../admin.event.api';
import { adminHealthApi } from '../admin.health.api';
import type { ListUsersWebResponse, SearchEventsResponse } from '@volontariapp/contracts';
import { ADMIN_USERS_COUNT_QUERY_KEY } from './use-admin-users';
import { ADMIN_EVENTS_COUNT_QUERY_KEY } from './use-admin-events';

const ADMIN_HEALTH_QUERY_KEY = ['admin', 'health'] as const;

export const useAdminDashboard = () => {
  const { data: usersData, error: usersError } = useQuery<ListUsersWebResponse>({
    queryKey: ADMIN_USERS_COUNT_QUERY_KEY,
    queryFn: async () => await adminUserApi.listUsers({ pagination: { page: 1, limit: 10 } }),
  });

  const { data: eventsData, error: eventsError } = useQuery<SearchEventsResponse>({
    queryKey: ADMIN_EVENTS_COUNT_QUERY_KEY,
    queryFn: async () => await adminEventApi.listEvents({ onlyAvailable: false }),
  });

  const { isSuccess: isHealthOk } = useQuery({
    queryKey: ADMIN_HEALTH_QUERY_KEY,
    queryFn: async () => {
      await adminHealthApi.checkHealth();
      return true;
    },
  });

  const usersCount = usersData?.pagination?.total ?? usersData?.users.length ?? 0;
  const eventsCount = eventsData?.totalCount ?? eventsData?.events.length ?? 0;

  return {
    usersCount,
    eventsCount,
    usersError,
    eventsError,
    isHealthOk,
  };
};
