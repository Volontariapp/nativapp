import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import type { AppEvent } from '@/api/event/event.api';
import { useGetEvents } from '@/api/event/hooks/use-get-events';
import { useLocation } from '@/hooks/use-location';
import type { UserCoordinates } from '@/hooks/use-location';
import { EventType } from '@volontariapp/contracts';
import type { EventCategoryFilter } from '@/components/map/MapFilterBar';
import { dedupeById } from '@/shared/utils/dedupe-by-id';
import { useElapsed } from '@/hooks/use-elapsed';
import {
  buildExploreSearchParams,
  isWithinDistance,
  shouldLoadMoreMapEvents,
} from './explore-search.utils';

const DEFAULT_DISTANCE_KM = 5;
/** Attente maximale de la position avant de chercher sans zone. */
const LOCATION_WAIT_MS = 4000;

// ─── Navigation Typing ────────────────────────────────────────────────────────
// ExploreScreen vit dans un tab ("explorer") ET dans une stack (MainStack).
// CompositeNavigationProp couvre les deux sans @ts-expect-error.

type TabParamList = {
  accueil: undefined;
  swipe: undefined;
  create: undefined;
  explorer: { initialLocation?: UserCoordinates };
  profil: undefined;
};

type ExploreScreenNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'explorer'>,
  NativeStackNavigationProp<MainStackParamList>
>;

type ExploreRouteProps = RouteProp<TabParamList, 'explorer'>;

// ─── Hook Result ──────────────────────────────────────────────────────────────

export interface UseExploreScreenResult {
  events: AppEvent[];
  isLoading: boolean;
  userCoordinates: UserCoordinates | null;
  initialLocation: UserCoordinates | undefined;
  mapKey: string;
  /** true si la permission GPS a été refusée */
  isPermissionDenied: boolean;
  selectedEvent: AppEvent | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: EventCategoryFilter;
  setSelectedCategory: (category: EventCategoryFilter) => void;
  selectedDistance: number | null;
  setSelectedDistance: (distance: number | null) => void;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  handleMarkerPress: (event: AppEvent) => void;
  handleOpenEvent: (event: AppEvent) => void;
  handleClosePrevue: () => void;
  handleMapPress: () => void;
}

/**
 * Hook de logique métier exclusif de ExploreScreen.
 * Réutilise useLocation (partagé avec SwipeScreen) → zéro duplication du IIFE.
 */
export function useExploreScreen(): UseExploreScreenResult {
  const navigation = useNavigation<ExploreScreenNavigation>();
  const route = useRoute<ExploreRouteProps>();

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const initialLocation = route.params?.initialLocation;

  const { coordinates: userCoordinates, isPermissionDenied } = useLocation();

  const [selectedDistance, setSelectedDistance] = useState<number | null>(DEFAULT_DISTANCE_KM);

  // Meme centre pour la recherche serveur et pour le filtre de distance. Memorise sur ses
  // coordonnees : `useLocation` recree son objet a chaque rendu.
  const centerLatitude = (initialLocation ?? userCoordinates)?.latitude;
  const centerLongitude = (initialLocation ?? userCoordinates)?.longitude;
  const center = useMemo<UserCoordinates | undefined>(
    () =>
      centerLatitude !== undefined && centerLongitude !== undefined
        ? { latitude: centerLatitude, longitude: centerLongitude }
        : undefined,
    [centerLatitude, centerLongitude],
  );

  // Sans position (GPS lent ou en echec), on n'attend pas indefiniment : la recherche part sans zone.
  const hasWaitedForLocation = useElapsed(LOCATION_WAIT_MS);
  const canSearch = center !== undefined || isPermissionDenied || hasWaitedForLocation;

  const searchParams = useMemo(
    () => buildExploreSearchParams({ center, distanceKm: selectedDistance }),
    [center, selectedDistance],
  );

  const {
    data: eventsData,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetEvents(searchParams, { enabled: canSearch });

  // La carte affiche tous les events de la zone : les pages suivantes se chargent seules.
  const loadedPages = eventsData?.pages.length ?? 0;
  useEffect(() => {
    if (shouldLoadMoreMapEvents({ hasNextPage, isFetchingNextPage, loadedPages })) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, loadedPages, fetchNextPage]);

  const events = useMemo(
    () => dedupeById(eventsData?.pages.flatMap((page) => page.events) ?? []),
    [eventsData],
  );

  const mapKey = useMemo(
    () =>
      initialLocation !== undefined
        ? `map-${String(initialLocation.latitude)}-${String(initialLocation.longitude)}`
        : 'map-default',
    [initialLocation],
  );

  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategoryFilter>('ALL');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Category filter
      if (selectedCategory === 'ECOLOGY') {
        const isEco =
          event.type === EventType.EVENT_TYPE_ECOLOGY ||
          (event.type as unknown) === 'EVENT_TYPE_ECOLOGY';
        if (!isEco) return false;
      } else if (selectedCategory === 'SOCIAL') {
        const isSocial =
          event.type === EventType.EVENT_TYPE_SOCIAL ||
          (event.type as unknown) === 'EVENT_TYPE_SOCIAL';
        if (!isSocial) return false;
      }

      // Search query filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesLocation = event.localisationName.toLowerCase().includes(query);
        const matchesDesc = event.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLocation && !matchesDesc) return false;
      }

      // Distance filter (meme centre que la recherche)
      if (!isWithinDistance(event, center, selectedDistance)) return false;

      // Date filter
      if (selectedDate !== null && event.startAt.length > 0) {
        const eventDate = event.startAt.split('T')[0];
        if (selectedDate.includes('-')) {
          if (eventDate !== selectedDate) return false;
        } else if (selectedDate.includes('/')) {
          const parts = selectedDate.split('/');
          if (parts.length === 3 && parts[0] != null && parts[1] != null && parts[2] != null) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            let year = parts[2];
            if (year.length === 2) year = `20${year}`;
            if (eventDate !== `${year}-${month}-${day}`) return false;
          }
        }
      }

      return true;
    });
  }, [events, selectedCategory, searchQuery, selectedDistance, center, selectedDate]);

  // Fermer la prévisualisation si l'événement sélectionné est filtré
  useEffect(() => {
    if (selectedEvent && !filteredEvents.some((e) => e.id === selectedEvent.id)) {
      setSelectedEvent(null);
    }
  }, [filteredEvents, selectedEvent]);

  const handleMarkerPress = useCallback((event: AppEvent): void => {
    setSelectedEvent(event);
  }, []);

  const handleOpenEvent = useCallback(
    (event: AppEvent): void => {
      navigation.navigate('EventDetail', { event });
    },
    [navigation],
  );

  const handleClosePrevue = useCallback((): void => {
    setSelectedEvent(null);
  }, []);

  const handleMapPress = useCallback((): void => {
    setSelectedEvent(null);
  }, []);

  return {
    events: filteredEvents,
    // Tant qu'on attend la position, la recherche n'est pas partie : la carte est en chargement.
    isLoading: isLoading || !canSearch,
    userCoordinates,
    initialLocation,
    mapKey,
    isPermissionDenied,
    selectedEvent,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDistance,
    setSelectedDistance,
    selectedDate,
    setSelectedDate,
    handleMarkerPress,
    handleOpenEvent,
    handleClosePrevue,
    handleMapPress,
  };
}
