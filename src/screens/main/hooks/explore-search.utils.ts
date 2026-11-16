import { EventState, type SearchEventsRequest } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import type { UserCoordinates } from '@/hooks/use-location';
import { normalizeEventState } from '@/shared/lib/event-mappers.utils';
import { calculateDistanceInKm } from '@/shared/lib/location.utils';
import { shouldLoadNextPage } from '@/shared/lib/paging.utils';

/** Taille d'une page de la carte. Les pages suivantes sont chargees automatiquement. */
export const MAP_EVENTS_PAGE_LIMIT = 50;

/** Plafond de pages chargees pour la carte (50 x 6 = 300 events), pour borner le cout reseau. */
export const MAP_EVENTS_MAX_PAGES = 6;

interface ExploreSearchInput {
  /** Centre de la recherche : lieu cible depuis le swipe, sinon position de l'utilisateur. */
  center: UserCoordinates | undefined;
  /** Distance choisie en km ; null = toutes les distances. */
  distanceKm: number | null;
  /** Borne temporelle basse (ISO 8601) pour exclure les événements déjà terminés côté serveur. */
  endAtFrom?: string;
}

/**
 * Parametres de recherche de la carte. Le rayon suit la distance choisie : le filtre doit etre
 * applique par le serveur, sinon la limite de page est consommee par des events trop lointains
 * qui sont ensuite masques cote client. Sans centre ou en mode illimite, aucune zone n'est
 * demandee. Les brouillons et événements terminés ne sont jamais proposés.
 */
export const buildExploreSearchParams = ({
  center,
  distanceKm,
  endAtFrom,
}: ExploreSearchInput): Partial<SearchEventsRequest> & { organizerId?: string } => ({
  excludeCreatedByMe: true,
  limit: MAP_EVENTS_PAGE_LIMIT,
  statuses: [EventState.EVENT_STATE_PUBLISHED, EventState.EVENT_STATE_IN_PROGRESS],
  ...(endAtFrom !== undefined && { endAtFrom }),
  ...(center !== undefined &&
    distanceKm !== null && {
      area: { center, radiusMeters: distanceKm * 1000 },
    }),
});

/**
 * Filtre temporel côté client pour la carte : conserve uniquement les événements
 * à venir ou actuellement en cours (non terminés, non annulés, non brouillons).
 */
export const isUpcomingMapEvent = (
  event: AppEvent,
  nowMs: number = Date.now(),
): boolean => {
  const state = normalizeEventState(event.state);
  if (
    state === EventState.EVENT_STATE_FINISHED ||
    state === EventState.EVENT_STATE_CANCELLED ||
    state === EventState.EVENT_STATE_DRAFT ||
    state === EventState.UNRECOGNIZED
  ) {
    return false;
  }

  if (state === EventState.EVENT_STATE_IN_PROGRESS) {
    return true;
  }

  const endMs = event.endAt.length > 0 ? Date.parse(event.endAt) : Number.NaN;
  const startMs = event.startAt.length > 0 ? Date.parse(event.startAt) : Number.NaN;
  const cutoffMs = !Number.isNaN(endMs) ? endMs : startMs;

  if (Number.isNaN(cutoffMs)) {
    return false;
  }

  return cutoffMs >= nowMs;
};

/**
 * Vérifie si un événement correspond à la date sélectionnée dans le filtre calendrier (YYYY-MM-DD ou DD/MM/YYYY).
 */
export const isMatchingSelectedDate = (
  event: AppEvent,
  selectedDate: string | null,
): boolean => {
  if (selectedDate === null || event.startAt.length === 0) {
    return true;
  }

  const eventDate = event.startAt.split('T')[0];
  if (selectedDate.includes('-')) {
    return eventDate === selectedDate;
  }

  if (selectedDate.includes('/')) {
    const parts = selectedDate.split('/');
    if (parts.length === 3 && parts[0] != null && parts[1] != null && parts[2] != null) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      let year = parts[2];
      if (year.length === 2) year = `20${year}`;
      return eventDate === `${year}-${month}-${day}`;
    }
  }

  return true;
};

/**
 * Filtre de distance cote client, mesure depuis le meme centre que la recherche serveur.
 * Les events sans lieu et les cas sans centre ou illimites ne sont jamais masques.
 */
export const isWithinDistance = (
  event: AppEvent,
  center: UserCoordinates | undefined,
  distanceKm: number | null,
): boolean => {
  if (distanceKm === null || center === undefined || event.location === undefined) {
    return true;
  }
  return (
    calculateDistanceInKm(
      center.latitude,
      center.longitude,
      event.location.latitude,
      event.location.longitude,
    ) <= distanceKm
  );
};

interface MapPagingState {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  loadedPages: number;
}

/** La carte charge seule les pages suivantes, dans la limite de `MAP_EVENTS_MAX_PAGES`. */
export const shouldLoadMoreMapEvents = (state: MapPagingState): boolean =>
  shouldLoadNextPage({ ...state, maxPages: MAP_EVENTS_MAX_PAGES });
