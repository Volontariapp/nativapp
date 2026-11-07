import { EventState } from '@volontariapp/contracts';
import { normalizeEventState } from '@/shared/lib/event-mappers.utils';
import { isEventLive } from '@/screens/event/manage-hub.utils';
import type { AppEvent } from './event.api';
import type { Coordinates } from '@/services/routing.service';
import { dedupeById } from '@/shared/utils/dedupe-by-id';

export const LIVE_SEARCH_RADIUS_M = 2000;
export const LIVE_SEARCH_LIMIT = 30;
export const LIVE_START_LOOKBACK_MS = 24 * 60 * 60 * 1000;
export const LIVE_MIN_USEFUL_PRESENCE_MS = 15 * 60 * 1000;
export const LIVE_MAX_WALK_S = 30 * 60;
export const LIVE_MAX_JOINABLE = 3;
export const LIVE_MAX_FULL_SHOWN = 2;
export const LIVE_MAX_ROUTING_CANDIDATES = 8;
export const WALKING_SPEED_MPS = 1.25;
export const LIVE_ARRIVAL_RADIUS_M = 50;
export const LIVE_POSITION_STALE_MS = 120 * 1000;

export type LiveCandidateAvailability = 'JOINABLE' | 'FULL';

export interface LiveEventCandidate {
  event: AppEvent;
  distanceMeters: number;
  walkSeconds: number;
  availability: LiveCandidateAvailability;
  isEstimated: boolean;
}

export interface LiveEventsResult {
  joinable: LiveEventCandidate[];
  full: LiveEventCandidate[];
}

export type LiveScreenStatus =
  'locating' | 'searching' | 'ready' | 'empty' | 'permission_denied' | 'error';

export function isEventFull(
  event: Pick<AppEvent, 'maxParticipants' | 'currentParticipants'>,
): boolean {
  return event.maxParticipants > 0 && event.currentParticipants >= event.maxParticipants;
}

export function isEventJoinableLive(
  event: AppEvent,
  now: number,
): event is AppEvent & { location: Coordinates } {
  if (event.location === undefined) {
    return false;
  }

  const endAtTime = new Date(event.endAt).getTime();
  if (Number.isNaN(endAtTime) || endAtTime <= now) {
    return false;
  }

  const state = normalizeEventState(event.state);
  if (state === EventState.EVENT_STATE_CANCELLED || state === EventState.EVENT_STATE_FINISHED) {
    return false;
  }

  return isEventLive(event, now);
}

/** Fusionne des listes d'evenements (sans doublon) et ne garde que ceux en direct (D1). */
export function selectJoinableLiveEvents(events: readonly AppEvent[], now: number): AppEvent[] {
  return dedupeById(events).filter((event) => isEventJoinableLive(event, now));
}

export function haversineMeters(a: Coordinates, b: Coordinates): number {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;
  const lat1 = a.latitude * rad;
  const lat2 = b.latitude * rad;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.round(R * c);
}

export function preselectLiveCandidates(
  events: AppEvent[],
  origin: Coordinates,
  now: number,
): { event: AppEvent; distanceMeters: number }[] {
  return events
    .filter((event): event is AppEvent & { location: Coordinates } =>
      isEventJoinableLive(event, now),
    )
    .map((event) => ({
      event,
      distanceMeters: haversineMeters(origin, event.location),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, LIVE_MAX_ROUTING_CANDIDATES);
}

export function buildLiveEventsResult(
  preselected: { event: AppEvent; distanceMeters: number }[],
  durations: (number | null)[],
  now: number,
): LiveEventsResult {
  const joinableCandidates: LiveEventCandidate[] = [];
  const fullCandidates: LiveEventCandidate[] = [];

  for (let i = 0; i < preselected.length; i += 1) {
    const item = preselected[i];
    if (item === undefined) {
      continue;
    }

    const duration = durations[i];
    const isDurationAvailable = duration !== null && duration !== undefined;
    const walkSeconds = isDurationAvailable
      ? Math.round(duration)
      : Math.round(item.distanceMeters / WALKING_SPEED_MPS);
    const isEstimated = !isDurationAvailable;

    if (walkSeconds > LIVE_MAX_WALK_S) {
      continue;
    }

    const endAtTime = new Date(item.event.endAt).getTime();
    const remainingTimeMs = endAtTime - now;
    const requiredTimeMs = walkSeconds * 1000 + LIVE_MIN_USEFUL_PRESENCE_MS;
    if (remainingTimeMs < requiredTimeMs) {
      continue;
    }

    const isFull = isEventFull(item.event);
    const availability: LiveCandidateAvailability = isFull ? 'FULL' : 'JOINABLE';

    const candidate: LiveEventCandidate = {
      event: item.event,
      distanceMeters: item.distanceMeters,
      walkSeconds,
      availability,
      isEstimated,
    };

    if (availability === 'FULL') {
      fullCandidates.push(candidate);
    } else {
      joinableCandidates.push(candidate);
    }
  }

  joinableCandidates.sort((a, b) => a.walkSeconds - b.walkSeconds);
  fullCandidates.sort((a, b) => a.walkSeconds - b.walkSeconds);

  return {
    joinable: joinableCandidates.slice(0, LIVE_MAX_JOINABLE),
    full: fullCandidates.slice(0, LIVE_MAX_FULL_SHOWN),
  };
}
