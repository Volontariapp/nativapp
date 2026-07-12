import { useCallback, useMemo } from 'react';
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
  /** Coordonnées de l'utilisateur pour le pin sur la carte */
  userCoordinates: UserCoordinates | null;
  /** Location passée en param de navigation (ex: depuis SwipeScreen) */
  initialLocation: UserCoordinates | undefined;
  /** Clé de remontage de la carte quand initialLocation change */
  mapKey: string;
  /** true si la permission GPS a été refusée */
  isPermissionDenied: boolean;
  handleMarkerPress: (event: AppEvent) => void;
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

  const centerLat = initialLocation?.latitude ?? userCoordinates?.latitude;
  const centerLon = initialLocation?.longitude ?? userCoordinates?.longitude;

  const { data: eventsData, isLoading } = useGetEvents({
    excludeCreatedByMe: true,
    limit: 50,
    ...(centerLat !== undefined &&
      centerLon !== undefined && {
        area: {
          center: {
            latitude: centerLat,
            longitude: centerLon,
          },
          radiusMeters: 50000,
        },
      }),
  });

  const events = useMemo(
    () => eventsData?.pages.flatMap((page) => page.events) ?? [],
    [eventsData],
  );

  const mapKey = useMemo(
    () =>
      initialLocation !== undefined
        ? `map-${String(initialLocation.latitude)}-${String(initialLocation.longitude)}`
        : 'map-default',
    [initialLocation],
  );

  const handleMarkerPress = useCallback(
    (event: AppEvent): void => {
      navigation.navigate('EventDetail', { event });
    },
    [navigation],
  );

  return {
    events,
    isLoading,
    userCoordinates,
    initialLocation,
    mapKey,
    isPermissionDenied,
    handleMarkerPress,
  };
}
