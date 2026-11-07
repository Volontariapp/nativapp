import { useAuth } from '@/context/auth/auth.context';
import { useEventAttendees } from '@/api/social/hooks/use-event-attendance';
import type { AppEvent } from '../event.api';
import { isCheckInExpected, isCheckInPending } from '../live-checkin.utils';

/**
 * Vrai tant que l'organisateur n'a pas pointe l'utilisateur sur un evenement en cours.
 * Aucune requete hors evenement en cours ; la liste est relue quand le serveur pousse
 * `event.attendance_updated` (voir useNotificationHandlers).
 */
export function usePendingCheckIn(event: AppEvent): boolean {
  const { userId } = useAuth();
  const expected = isCheckInExpected(event, userId, Date.now());
  const { data } = useEventAttendees(event.id, undefined, { enabled: expected });

  return expected && isCheckInPending(data?.attendees, userId);
}
