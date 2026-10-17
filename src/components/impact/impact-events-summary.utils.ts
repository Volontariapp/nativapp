import { EventState } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import { normalizeEventState } from '@/shared/lib/event-mappers.utils';
import type { ImpactCardNextEvent } from './impact-card.types';

export interface ImpactEventsSummary {
  finishedCount: number;
  nextEvent: ImpactCardNextEvent | null;
}

const toTime = (value: string): number => new Date(value).getTime();

const NOT_UPCOMING_STATES: ReadonlySet<EventState> = new Set([
  EventState.EVENT_STATE_FINISHED,
  EventState.EVENT_STATE_CANCELLED,
]);

const endTimeOf = (event: AppEvent): number =>
  toTime(event.endAt === '' ? event.startAt : event.endAt);

// Une date invalide donne NaN, et NaN >= x vaut toujours false : l'evenement est alors ecarte.
const isUpcoming = (event: AppEvent, now: Date): boolean => {
  if (NOT_UPCOMING_STATES.has(normalizeEventState(event.state))) return false;
  return endTimeOf(event) >= now.getTime();
};

/**
 * A partir des evenements auxquels l'utilisateur participe : nombre d'evenements
 * termines (entree des paliers de badge) et prochain evenement a venir.
 */
export function summarizeImpactEvents(events: AppEvent[], now: Date): ImpactEventsSummary {
  const finishedCount = events.filter(
    (event) => normalizeEventState(event.state) === EventState.EVENT_STATE_FINISHED,
  ).length;

  const [next] = events
    .filter((event) => isUpcoming(event, now))
    .sort((a, b) => toTime(a.startAt) - toTime(b.startAt));

  return {
    finishedCount,
    nextEvent: next === undefined ? null : { title: next.title, startAt: next.startAt },
  };
}
