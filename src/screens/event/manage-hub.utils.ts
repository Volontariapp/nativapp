import { EventState, EventType } from '@volontariapp/contracts';
import { normalizeEventState } from '@/shared/lib/event-mappers.utils';
import { getEventStatusConfig, isEventDatePast } from '@/components/event/event-status.utils';
import type { AppEvent } from '@/api/event/event.api';

export type ManageTabType = 'participated' | 'wished' | 'created';
export type EventTypeFilter = 'all' | 'social' | 'ecology';
export type ParticipatedScope = 'all' | 'live' | 'upcoming';

interface EventSchedule {
  start: number;
  end: number;
}

function readSchedule(event: AppEvent): EventSchedule {
  return {
    start: new Date(event.startAt).getTime(),
    end: new Date(event.endAt || event.startAt).getTime(),
  };
}

/** 0 = en direct, 1 = à venir, 2 = passé. */
function categorizeEvent(event: AppEvent, { start, end }: EventSchedule, now: number): 0 | 1 | 2 {
  const state = normalizeEventState(event.state);
  if ((now >= start && now <= end) || state === EventState.EVENT_STATE_IN_PROGRESS) return 0;
  return end < now || state === EventState.EVENT_STATE_FINISHED ? 2 : 1;
}

/**
 * Tri pour afficher toujours l'événement qui arrive le plus vite :
 * 1. Événements en direct (en cours en ce moment) -> en tête
 * 2. Événements à venir (startAt > now) -> triés par date de début croissante (le plus proche en premier)
 * 3. Événements passés (endAt < now) -> placés à la fin, triés du plus récent au plus ancien
 */
export function sortEventsByEarliestUpcoming(a: AppEvent, b: AppEvent, now = Date.now()): number {
  const scheduleA = readSchedule(a);
  const scheduleB = readSchedule(b);

  const isInvalidA = Number.isNaN(scheduleA.start);
  const isInvalidB = Number.isNaN(scheduleB.start);
  if (isInvalidA && isInvalidB) return 0;
  if (isInvalidA) return 1;
  if (isInvalidB) return -1;

  const categoryA = categorizeEvent(a, scheduleA, now);
  const categoryB = categorizeEvent(b, scheduleB, now);
  if (categoryA !== categoryB) return categoryA - categoryB;

  // Passés : le plus récent en premier. En direct / à venir : le plus proche en premier.
  return categoryA === 2 ? scheduleB.end - scheduleA.end : scheduleA.start - scheduleB.start;
}

/** Événement en cours : dans sa plage horaire ou explicitement "en cours". */
export function isEventLive(event: AppEvent, now: number): boolean {
  const start = new Date(event.startAt).getTime();
  const end = new Date(event.endAt).getTime();
  return (
    (now >= start && now <= end) ||
    normalizeEventState(event.state) === EventState.EVENT_STATE_IN_PROGRESS
  );
}

/** Événement pas encore commencé, ni terminé ni annulé. */
export function isEventUpcoming(event: AppEvent, now: number): boolean {
  const state = normalizeEventState(event.state);
  return (
    now < new Date(event.startAt).getTime() &&
    state !== EventState.EVENT_STATE_FINISHED &&
    state !== EventState.EVENT_STATE_CANCELLED
  );
}

/** Filtre "En cours" : toutes, en direct ou à venir. */
export function filterByScope(
  events: AppEvent[],
  scope: ParticipatedScope,
  now: number,
): AppEvent[] {
  if (scope === 'live') return events.filter((event) => isEventLive(event, now));
  if (scope === 'upcoming') return events.filter((event) => isEventUpcoming(event, now));
  return events;
}

/** Filtre par type : tous, social ou écologie. */
export function filterByType(events: AppEvent[], filter: EventTypeFilter): AppEvent[] {
  if (filter === 'all') return events;
  const type = filter === 'social' ? EventType.EVENT_TYPE_SOCIAL : EventType.EVENT_TYPE_ECOLOGY;
  return events.filter((event) => event.type === type || String(event.type) === EventType[type]);
}

/**
 * Vérifie si un événement est considéré comme annulé :
 * - Statut explicite EventState.EVENT_STATE_CANCELLED
 * - Ou statut 'Annulé' calculé par la configuration de statut (ex: événement publié dont la date est passée)
 */
export function isEventCancelled(event: AppEvent): boolean {
  const state = normalizeEventState(event.state);
  if (state === EventState.EVENT_STATE_CANCELLED) {
    return true;
  }
  const isPast = isEventDatePast(event.endAt, event.startAt);
  const statusConfig = getEventStatusConfig(event.state, isPast);
  return statusConfig.label === 'Annulé';
}
