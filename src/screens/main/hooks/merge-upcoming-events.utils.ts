import { EventState } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import { sortEventsByStartAt } from '@/shared/lib/event-date.utils';
import { normalizeEventState } from '@/shared/lib/event-mappers.utils';

const EXCLUDED_STATES: readonly EventState[] = [
  EventState.EVENT_STATE_FINISHED,
  EventState.EVENT_STATE_CANCELLED,
  EventState.EVENT_STATE_DRAFT,
];

const isUpcoming = (event: AppEvent, now: Date): boolean => {
  if (EXCLUDED_STATES.includes(normalizeEventState(event.state))) return false;
  const end = new Date(event.endAt || event.startAt);
  return Number.isNaN(end.getTime()) || end.getTime() >= now.getTime();
};

/**
 * Évènements à venir de l'utilisateur : ceux où il participe et ceux qu'il a créés, sans
 * doublon, hors terminés, annulés, brouillons et passés, triés du plus proche au plus lointain.
 */
export const mergeUpcomingEvents = (
  participated: readonly AppEvent[],
  created: readonly AppEvent[],
  now: Date = new Date(),
): AppEvent[] => {
  const byId = new Map<string, AppEvent>();
  [...participated, ...created].forEach((event) => {
    if (!byId.has(event.id)) byId.set(event.id, event);
  });
  return sortEventsByStartAt([...byId.values()].filter((event) => isUpcoming(event, now)));
};
