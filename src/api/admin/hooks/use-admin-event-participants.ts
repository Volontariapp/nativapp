import { useQuery } from '@tanstack/react-query';
import { adminUserApi } from '../admin.user.api';
import type { ListUsersWebResponse } from '@volontariapp/contracts';

interface UseAdminEventParticipantsOptions {
  eventId: string;
  page?: number;
  limit?: number;
}

export function useAdminEventParticipants({
  eventId,
  page = 1,
  limit = 50,
}: UseAdminEventParticipantsOptions) {
  return useQuery<ListUsersWebResponse>({
    queryKey: ['admin-event-participants', eventId, page, limit],
    queryFn: () =>
      adminUserApi.getEventParticipants(
        {
          pagination: { page, limit },
        },
        { eventId },
      ),
    enabled: !!eventId,
  });
}
