import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LocationObject } from 'expo-location';
import type Swiper from 'react-native-deck-swiper';
import { EventState } from '@volontariapp/contracts';

import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import type { AppEvent } from '@/api/event/event.api';
import { useGetEvents } from '@/api/event/hooks/use-get-events';
import { useSwipeEventMemory } from './use-swipe-event-memory';
import { useUserSocialActions } from '@/api/social/hooks/use-user-social-actions';
import { useSwipeLocation } from './use-swipe-location';
import { useSwipePassFeedback } from './use-swipe-pass-feedback';
import type { UserCoordinates } from '@/hooks/use-location';
import { listVersionOf, useSwipeStackReload } from './use-swipe-stack-reload';
import { useRankingEvents } from '@/api/ranking/hooks/use-ranking-events';

type TabParamList = {
  accueil: undefined;
  swipe: undefined;
  create: undefined;
  explorer: { initialLocation?: UserCoordinates };
  profil: undefined;
};

type SwipeScreenNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'swipe'>,
  NativeStackNavigationProp<MainStackParamList>
>;

const SWIPE_PREFETCH_THRESHOLD = 10;
const EVENTS_PAGE_LIMIT = 20;

export interface UseSwipeScreenResult {
  events: AppEvent[];
  isLoading: boolean;
  isError: boolean;
  isEndReached: boolean;
  currentIndex: number;
  userLocation: LocationObject | null;
  swiperRef: React.RefObject<Swiper<AppEvent> | null>;
  handleSwipeLeft: (cardIndex: number) => void;
  handleSwipeRight: (cardIndex: number) => void;
  handleTapCard: (cardIndex: number) => void;
  handleLocationPress: (event: AppEvent) => void;
}

export function useSwipeScreen(): UseSwipeScreenResult {
  const navigation = useNavigation<SwipeScreenNavigation>();

  // Requête principale : classement intelligent via MS Ranking
  const rankingQuery = useRankingEvents({ limit: EVENTS_PAGE_LIMIT });

  // Détection du 206 FALLBACK_ACTIVATED : repli gracieux sur useGetEvents
  const isFallbackMode = Boolean(rankingQuery.data?.pages[0]?.isFallback);

  // Requête de repli sans DRAFT (uniquement les événements publiés)
  const fallbackParams = useMemo(
    () => ({
      limit: EVENTS_PAGE_LIMIT,
      excludeCreatedByMe: true,
      excludeWishedByMe: true,
      excludeParticipatedByMe: true,
      statuses: [EventState.EVENT_STATE_PUBLISHED],
      startDateFrom: new Date().toISOString(),
    }),
    [],
  );

  const fallbackQuery = useGetEvents(fallbackParams);

  const { wish } = useUserSocialActions();
  const { excludedIds, markHandled, refreshExclusions } = useSwipeEventMemory();
  const { queuePass, flushPendingPass } = useSwipePassFeedback();
  const { userLocation, sendLocationIfAllowed } = useSwipeLocation();

  const swiperRef = useRef<Swiper<AppEvent> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Écoute des transitions de cycle de vie de l'application
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        void flushPendingPass();
      } else if (nextState === 'active') {
        void sendLocationIfAllowed();
      }
    });

    return () => {
      subscription.remove();
      void flushPendingPass();
    };
  }, [flushPendingPass, sendLocationIfAllowed]);

  // Récupération des événements avec déduplication stricte par identifiant
  const events = useMemo(() => {
    let freshEvents: AppEvent[] = [];
    if (isFallbackMode) {
      freshEvents = fallbackQuery.data?.pages.flatMap((page) => page.events) ?? [];
    } else {
      freshEvents =
        rankingQuery.data?.pages.flatMap((page) => (page.isFallback ? [] : page.events)) ?? [];
    }

    // Jamais un event deja souhaite, auquel on participe ou passe pendant la session
    const seen = new Set<string>();
    return freshEvents.filter((e) => {
      if (seen.has(e.id) || excludedIds.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }, [isFallbackMode, fallbackQuery.data, rankingQuery.data, excludedIds]);

  const activeQuery = isFallbackMode ? fallbackQuery : rankingQuery;
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;
  const hasNextPage = activeQuery.hasNextPage;
  const isFetchingNextPage = activeQuery.isFetchingNextPage;
  const fetchNextPage = activeQuery.fetchNextPage;

  const isEndReached =
    currentIndex >= events.length && !hasNextPage && !isFetchingNextPage && events.length > 0;

  // Recalcul automatique quand il n'y a plus rien a proposer : fin de pile, ou aucun event servi
  // a l'ouverture (liste stockee entierement expiree). Sans effet en mode repli.
  const isEmptyStack = events.length === 0;
  useSwipeStackReload({
    isStackExhausted:
      !isLoading &&
      !isError &&
      !isFetchingNextPage &&
      !hasNextPage &&
      currentIndex >= events.length &&
      !(isEmptyStack && isFallbackMode),
    isEmpty: isEmptyStack,
    currentListVersion: listVersionOf(rankingQuery.data),
    reloadRanking: async () => listVersionOf((await rankingQuery.refetch()).data),
    onReloaded: () => {
      // Nouvelle pile : les events traites en sortent et le deck repart de la premiere carte
      refreshExclusions();
      setCurrentIndex(0);
    },
  });

  const swipeStateRef = useRef({ events, hasNextPage, isFetchingNextPage, fetchNextPage, wish });
  useLayoutEffect(() => {
    swipeStateRef.current = { events, hasNextPage, isFetchingNextPage, fetchNextPage, wish };
  }, [events, hasNextPage, isFetchingNextPage, fetchNextPage, wish]);

  const triggerPrefetchIfNeeded = (cardIndex: number): void => {
    const {
      events: currentEvents,
      hasNextPage: hasNext,
      isFetchingNextPage: isFetching,
      fetchNextPage: fetchNext,
    } = swipeStateRef.current;
    if (
      cardIndex + 1 + SWIPE_PREFETCH_THRESHOLD >= currentEvents.length &&
      hasNext &&
      !isFetching
    ) {
      void fetchNext();
    }
  };

  const handleSwipeRight = useCallback(
    (cardIndex: number): void => {
      const { events: currentEvents, wish: currentWish } = swipeStateRef.current;
      const event = currentEvents[cardIndex];
      if (event != null) {
        markHandled(event.id);
        void currentWish(event.id);
      }
      setCurrentIndex((prev) => prev + 1);
      triggerPrefetchIfNeeded(cardIndex);
    },
    [markHandled],
  );

  const handleSwipeLeft = useCallback(
    (cardIndex: number): void => {
      const { events: currentEvents } = swipeStateRef.current;
      const event = currentEvents[cardIndex];
      if (event != null) {
        markHandled(event.id);
        queuePass(event.id);
      }
      setCurrentIndex((prev) => prev + 1);
      triggerPrefetchIfNeeded(cardIndex);
    },
    [queuePass, markHandled],
  );

  const handleTapCard = useCallback(
    (cardIndex: number): void => {
      const event = swipeStateRef.current.events[cardIndex];
      if (event != null) {
        navigation.navigate('EventDetail', { event });
      }
    },
    [navigation],
  );

  const handleLocationPress = useCallback(
    (event: AppEvent): void => {
      if (event.location !== undefined) {
        navigation.navigate('explorer', { initialLocation: event.location });
      }
    },
    [navigation],
  );

  return {
    events,
    isLoading,
    isError,
    isEndReached,
    currentIndex,
    userLocation,
    swiperRef,
    handleSwipeLeft,
    handleSwipeRight,
    handleTapCard,
    handleLocationPress,
  };
}
