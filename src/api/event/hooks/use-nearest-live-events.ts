import { useQuery } from '@tanstack/react-query';
import { EventState } from '@volontariapp/contracts';
import type { SearchEventsRequest } from '@volontariapp/contracts';
import { routingService, type Coordinates } from '@/services/routing.service';
import { eventApi } from '../event.api';
import {
  buildLiveEventsResult,
  LIVE_SEARCH_LIMIT,
  LIVE_SEARCH_RADIUS_M,
  LIVE_START_LOOKBACK_MS,
  preselectLiveCandidates,
  type LiveEventsResult,
} from '../live-events.utils';

export const NEAREST_LIVE_EVENTS_QUERY_KEY = ['nearest-live-events'] as const;

/**
 * Parametres de recherche des evenements en direct. Le serveur filtre maintenant la fin
 * (endAtFrom) ; le filtre client de live-events.utils reste en garde-fou.
 */
export function buildLiveSearchParams(
  position: Coordinates,
  now: number,
): Partial<SearchEventsRequest> {
  return {
    area: { center: position, radiusMeters: LIVE_SEARCH_RADIUS_M },
    statuses: [EventState.EVENT_STATE_PUBLISHED, EventState.EVENT_STATE_IN_PROGRESS],
    startDateFrom: new Date(now - LIVE_START_LOOKBACK_MS).toISOString(),
    startDateTo: new Date(now).toISOString(),
    endAtFrom: new Date(now).toISOString(),
    onlyAvailable: false,
    excludeBlockedUsers: true,
    excludeParticipatedByMe: true,
    excludeCreatedByMe: true,
    page: 1,
    limit: LIVE_SEARCH_LIMIT,
  };
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }
}

/** Repli : sans OSRM, toutes les durees sont null (le calcul retombe sur le vol d'oiseau). */
async function fetchDurationsOrFallback(
  origin: Coordinates,
  destinations: Coordinates[],
  signal: AbortSignal,
): Promise<(number | null)[]> {
  try {
    const { durationsSeconds } = await routingService.fetchWalkingDurations(
      origin,
      destinations,
      signal,
    );
    return durationsSeconds;
  } catch (error) {
    throwIfAborted(signal);
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    return destinations.map(() => null);
  }
}

async function fetchNearestLiveEvents(
  position: Coordinates,
  signal: AbortSignal,
): Promise<LiveEventsResult> {
  const now = Date.now();
  const { events } = await eventApi.getEvents(buildLiveSearchParams(position, now));
  throwIfAborted(signal);

  const preselected = preselectLiveCandidates(events, position, now);
  if (preselected.length === 0) {
    return { joinable: [], full: [] };
  }

  const destinations = preselected.flatMap(({ event }) =>
    event.location === undefined ? [] : [event.location],
  );
  const durations = await fetchDurationsOrFallback(position, destinations, signal);
  throwIfAborted(signal);

  return buildLiveEventsResult(preselected, durations, now);
}

/** Une seule page : au plus LIVE_SEARCH_LIMIT evenements autour de la position fournie. */
export const useNearestLiveEvents = (position: Coordinates | null) => {
  return useQuery({
    queryKey: [...NEAREST_LIVE_EVENTS_QUERY_KEY, position?.latitude, position?.longitude],
    queryFn: ({ signal }) => {
      if (position === null) {
        throw new Error('Position requise pour chercher les evenements en direct');
      }
      return fetchNearestLiveEvents(position, signal);
    },
    enabled: position !== null,
    retry: false,
  });
};
