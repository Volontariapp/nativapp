import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LocationObject } from 'expo-location';

import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import type { AppEvent } from '@/api/event/event.api';
import { useGetEvents } from '@/api/event/hooks/use-get-events';
import { useUserSocialActions } from '@/api/social/hooks/use-user-social-actions';
import { useLocation } from '@/hooks/use-location';
import type { UserCoordinates } from '@/hooks/use-location';
import type Swiper from 'react-native-deck-swiper';

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

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useGetEvents(
    { limit: EVENTS_PAGE_LIMIT, excludeCreatedByMe: true, excludeWishedByMe: true },
  );

  const { wish } = useUserSocialActions();
  const { locationObject: userLocation } = useLocation();

  const swiperRef = useRef<Swiper<AppEvent> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const events = useMemo(() => {
    const freshEvents = data?.pages.flatMap((page) => page.events) ?? [];
    const seen = new Set<string>();
    return freshEvents.filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }, [data]);

  const isEndReached = currentIndex >= events.length && !hasNextPage && !isFetchingNextPage;

  const swipeStateRef = useRef({ events, hasNextPage, isFetchingNextPage, fetchNextPage, wish });
  swipeStateRef.current = { events, hasNextPage, isFetchingNextPage, fetchNextPage, wish };

  const handleSwipeRight = useCallback((cardIndex: number): void => {
    const { events: currentEvents, wish: currentWish } = swipeStateRef.current;
    const event = currentEvents[cardIndex];
    if (event != null) {
      void currentWish(event.id);
    }
    setCurrentIndex((prev) => prev + 1);
    triggerPrefetchIfNeeded(cardIndex);
  }, []);

  const handleSwipeLeft = useCallback((cardIndex: number): void => {
    setCurrentIndex((prev) => prev + 1);
    triggerPrefetchIfNeeded(cardIndex);
  }, []);

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
