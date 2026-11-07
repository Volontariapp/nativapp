import type { EventAttendee } from '@volontariapp/contracts';
import { isEventLive } from '@/screens/event/manage-hub.utils';
import type { AppEvent } from './event.api';

/**
 * Vrai quand l'utilisateur participe a un evenement en cours sans etre l'organisateur :
 * seul cas ou un pointage par l'organisateur est attendu.
 */
export function isCheckInExpected(event: AppEvent, userId: string | null, now: number): boolean {
  if (userId === null || event.organizerId === userId) {
    return false;
  }
  return isEventLive(event, now);
}

/**
 * Vrai quand l'utilisateur figure parmi les inscrits sans date de pointage.
 * Un utilisateur absent de la liste (page non chargee) n'est pas considere en attente.
 */
export function isCheckInPending(
  attendees: readonly EventAttendee[] | undefined,
  userId: string | null,
): boolean {
  if (attendees === undefined || userId === null) {
    return false;
  }
  const mine = attendees.find((attendee) => attendee.userId === userId);
  return mine !== undefined && mine.checkedInAt === undefined;
}
