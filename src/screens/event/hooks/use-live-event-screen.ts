import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import type { AppEvent } from '@/api/event/event.api';
import { useGetMyEvents } from '@/api/event/hooks/use-get-my-events';
import { useGetParticipatedEvents } from '@/api/event/hooks/use-get-participated-events';
import { useNearestLiveEvents } from '@/api/event/hooks/use-nearest-live-events';
import {
  selectJoinableLiveEvents,
  type LiveEventCandidate,
  type LiveEventsResult,
  type LiveScreenStatus,
} from '@/api/event/live-events.utils';
import { useUserSocialActions } from '@/api/social/hooks/use-user-social-actions';
import { useCurrentPosition } from '@/hooks/use-current-position';
import type { LiveSharingState } from '@/hooks/live-sharing.types';
import { useLiveSharing } from '@/hooks/use-live-sharing';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import { routingService, type Coordinates, type WalkingRoute } from '@/services/routing.service';

/** Meme limite que ManageHub : les deux requetes partagent le cache React Query. */
const MY_EVENTS_PAGE_LIMIT = 10;
const EMPTY_RESULT: LiveEventsResult = { joinable: [], full: [] };

export interface LiveMyEvent {
  event: AppEvent;
  isOrganizer: boolean;
}

export interface LiveSelectedRoute {
  event: AppEvent;
  route: WalkingRoute | null;
  isLoading: boolean;
  isError: boolean;
}

export interface UseLiveEventScreenResult {
  status: LiveScreenStatus;
  position: Coordinates | null;
  result: LiveEventsResult;
  myEvents: LiveMyEvent[];
  participatingEventId: string | null;
  leavingEventId: string | null;
  selectedRoute: LiveSelectedRoute | null;
  sharing: LiveSharingState;
  handleToggleSharing: (event: AppEvent, enabled: boolean) => void;
  handleParticipate: (event: AppEvent) => void;
  /** Demande confirmation, puis arrete le partage, se desinscrit et retire l'evenement. */
  handleLeave: (event: AppEvent) => void;
  handleSelectRoute: (event: AppEvent) => void;
  handleClearRoute: () => void;
  handleRetry: () => void;
  handleOpenDetail: (event: AppEvent) => void;
  handleBack: () => void;
}

const useWalkingRoute = (origin: Coordinates | null, destination: Coordinates | null) =>
  useQuery({
    queryKey: [
      'live-walking-route',
      origin?.latitude,
      origin?.longitude,
      destination?.latitude,
      destination?.longitude,
    ],
    queryFn: ({ signal }) => {
      if (origin === null || destination === null) {
        throw new Error('Origine et destination requises pour le trace');
      }
      return routingService.fetchWalkingRoute(origin, destination, signal);
    },
    enabled: origin !== null && destination !== null,
    retry: false,
  });

function deriveStatus(
  positionStatus: ReturnType<typeof useCurrentPosition>['status'],
  query: ReturnType<typeof useNearestLiveEvents>,
): LiveScreenStatus {
  if (positionStatus === 'permission_denied') return 'permission_denied';
  if (positionStatus === 'error') return 'error';
  if (positionStatus !== 'ready') return 'locating';
  if (query.isError) return 'error';
  if (query.data === undefined) return 'searching';
  return query.data.joinable.length + query.data.full.length === 0 ? 'empty' : 'ready';
}

/** Participations, evenements organises (D20) et evenements rejoints ici, en direct (D1). */
function mergeMyLiveEvents(
  organized: AppEvent[],
  participated: AppEvent[],
  joined: AppEvent[],
  now: number,
): LiveMyEvent[] {
  const organizedIds = new Set(organized.map((event) => event.id));
  return selectJoinableLiveEvents([...organized, ...participated, ...joined], now).map((event) => ({
    event,
    isOrganizer: organizedIds.has(event.id),
  }));
}

export function useLiveEventScreen(): UseLiveEventScreenResult {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { status: positionStatus, coordinates, refresh } = useCurrentPosition();
  const query = useNearestLiveEvents(coordinates);
  const participatedQuery = useGetParticipatedEvents(MY_EVENTS_PAGE_LIMIT);
  const myEventsQuery = useGetMyEvents(MY_EVENTS_PAGE_LIMIT);
  const { participate, unparticipate } = useUserSocialActions();
  const { start: startSharing, stop: stopSharing, ...sharing } = useLiveSharing();

  const [joinedEvents, setJoinedEvents] = useState<AppEvent[]>([]);
  const [participatingEventId, setParticipatingEventId] = useState<string | null>(null);
  const [leavingEventId, setLeavingEventId] = useState<string | null>(null);
  const [leftEventIds, setLeftEventIds] = useState<string[]>([]);
  const [routeEvent, setRouteEvent] = useState<AppEvent | null>(null);

  const { refetch } = query;
  const routeQuery = useWalkingRoute(coordinates, routeEvent?.location ?? null);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const myEvents = useMemo(
    () =>
      mergeMyLiveEvents(
        myEventsQuery.data?.pages.flatMap((page) => page.events) ?? [],
        participatedQuery.data?.pages.flatMap((page) => page.events) ?? [],
        joinedEvents,
        Date.now(),
      ).filter(({ event }) => !leftEventIds.includes(event.id)),
    [myEventsQuery.data, participatedQuery.data, joinedEvents, leftEventIds],
  );

  const result = useMemo<LiveEventsResult>(() => {
    if (query.data === undefined) return EMPTY_RESULT;
    const joinedIds = new Set(joinedEvents.map((event) => event.id));
    const keep = (candidate: LiveEventCandidate): boolean => !joinedIds.has(candidate.event.id);
    return { joinable: query.data.joinable.filter(keep), full: query.data.full.filter(keep) };
  }, [query.data, joinedEvents]);

  const handleParticipate = useCallback(
    (event: AppEvent) => {
      setParticipatingEventId(event.id);
      participate(event.id)
        .then(() => {
          setLeftEventIds((previous) => previous.filter((id) => id !== event.id));
          setJoinedEvents((previous) => [
            ...previous,
            { ...event, currentParticipants: event.currentParticipants + 1 },
          ]);
        })
        .catch(() => {
          Alert.alert('Erreur', 'Impossible de rejoindre cet événement.');
        })
        .finally(() => {
          setParticipatingEventId(null);
        });
    },
    [participate],
  );

  const leaveEvent = useCallback(
    async (event: AppEvent) => {
      setLeavingEventId(event.id);
      try {
        // Le partage s'arrete d'abord : plus aucune position ne part vers un evenement quitte.
        if (sharing.activeEventId === event.id && sharing.status !== 'idle') {
          await stopSharing('LEFT');
        }
        await unparticipate(event.id);
        setJoinedEvents((previous) => previous.filter((joined) => joined.id !== event.id));
        setLeftEventIds((previous) => [...previous, event.id]);
        setRouteEvent((current) => (current?.id === event.id ? null : current));
      } catch {
        Alert.alert('Erreur', 'Impossible de quitter cet événement.');
      } finally {
        setLeavingEventId(null);
      }
    },
    [sharing.activeEventId, sharing.status, stopSharing, unparticipate],
  );

  const handleLeave = useCallback(
    (event: AppEvent) => {
      Alert.alert("Quitter l'événement", `Ne plus participer à « ${event.title} » ?`, [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: () => {
            void leaveEvent(event);
          },
        },
      ]);
    },
    [leaveEvent],
  );

  const handleToggleSharing = useCallback(
    (event: AppEvent, enabled: boolean) => {
      if (!enabled) {
        void stopSharing('STOPPED');
        return;
      }
      if (event.location !== undefined) {
        void startSharing({ eventId: event.id, location: event.location });
      }
    },
    [startSharing, stopSharing],
  );

  const handleRetry = useCallback(() => {
    if (positionStatus === 'ready' && query.isError) {
      void refetch();
      return;
    }
    void refresh();
  }, [positionStatus, query.isError, refetch, refresh]);

  const handleOpenDetail = useCallback(
    (event: AppEvent) => {
      navigation.navigate('EventDetail', { event });
    },
    [navigation],
  );

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleClearRoute = useCallback(() => {
    setRouteEvent(null);
  }, []);

  const selectedRoute: LiveSelectedRoute | null =
    routeEvent === null
      ? null
      : {
          event: routeEvent,
          route: routeQuery.data ?? null,
          isLoading: routeQuery.isLoading,
          isError: routeQuery.isError,
        };

  return {
    status: deriveStatus(positionStatus, query),
    position: coordinates,
    result,
    myEvents,
    participatingEventId,
    leavingEventId,
    selectedRoute,
    sharing,
    handleToggleSharing,
    handleParticipate,
    handleLeave,
    handleSelectRoute: setRouteEvent,
    handleClearRoute,
    handleRetry,
    handleOpenDetail,
    handleBack,
  };
}
