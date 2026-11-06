import { EventState, type SearchEventsRequest } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import type { UserCoordinates } from '@/hooks/use-location';
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
}

/**
 * Parametres de recherche de la carte. Le rayon suit la distance choisie : le filtre doit etre
 * applique par le serveur, sinon la limite de page est consommee par des events trop lointains
 * qui sont ensuite masques cote client. Sans centre ou en mode illimite, aucune zone n'est
 * demandee. Les brouillons ne sont jamais proposes (comme le swipe).
 */
export const buildExploreSearchParams = ({
  center,
  distanceKm,
}: ExploreSearchInput): Partial<SearchEventsRequest> & { organizerId?: string } => ({
  excludeCreatedByMe: true,
  limit: MAP_EVENTS_PAGE_LIMIT,
  statuses: [EventState.EVENT_STATE_PUBLISHED],
  ...(center !== undefined &&
    distanceKm !== null && {
      area: { center, radiusMeters: distanceKm * 1000 },
    }),
});

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
