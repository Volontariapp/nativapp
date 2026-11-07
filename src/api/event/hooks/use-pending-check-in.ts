import { useAuth } from '@/context/auth/auth.context';
import { useEventAttendees } from '@/api/social/hooks/use-event-attendance';
import type { AppEvent } from '../event.api';
import {
  CHECK_IN_REFETCH_INTERVAL_MS,
  isCheckInExpected,
  isCheckInPending,
} from '../live-checkin.utils';

/**
 * Vrai tant que l'organisateur n'a pas pointe l'utilisateur sur un evenement en cours.
 * Aucune requete hors evenement en cours ; le statut est rafraichi periodiquement (le push WS
 * remplacera ce polling).
 */
export function usePendingCheckIn(event: AppEvent): boolean {
  const { userId } = useAuth();
  const expected = isCheckInExpected(event, userId, Date.now());
  const { data } = useEventAttendees(event.id, undefined, {
    enabled: expected,
    refetchInterval: CHECK_IN_REFETCH_INTERVAL_MS,
  });

  return expected && isCheckInPending(data?.attendees, userId);
}
