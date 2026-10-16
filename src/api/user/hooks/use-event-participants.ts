import { useQuery } from '@tanstack/react-query';
import { userApi, type UserPublicProfile } from '../user.api';

const MAX_DISPLAYED_PARTICIPANTS = 5;

/** Premiers participants d'un événement, avec leur photo, pour l'aperçu du détail. */
export const useEventParticipants = (eventId: string) =>
  useQuery<UserPublicProfile[]>({
    queryKey: ['event-participants', eventId, MAX_DISPLAYED_PARTICIPANTS],
    queryFn: () =>
      userApi.getEventParticipants(eventId, { page: 1, limit: MAX_DISPLAYED_PARTICIPANTS }),
  });
