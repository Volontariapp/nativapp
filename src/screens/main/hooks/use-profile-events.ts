import { useMemo } from 'react';
import { EventState } from '@volontariapp/contracts';
import { useGetMyEvents } from '@/api/event/hooks/use-get-my-events';
import { useGetParticipatedEvents } from '@/api/event/hooks/use-get-participated-events';
import type { PaginatedEventListData } from '@/components/profile/profile-events.types';
import { normalizeEventState } from '@/shared/lib/event-mappers.utils';
import { mergeUpcomingEvents } from './merge-upcoming-events.utils';

const PROFILE_EVENTS_PAGE_SIZE = 10;

interface ProfileEventsHookReturn {
  /** Participations et évènements créés encore à venir, fusionnés et triés par date. */
  upcoming: PaginatedEventListData;
  /** Participations terminées. Créés, wishlist et participations vivent dans la gestion. */
  finished: PaginatedEventListData & { totalCount: number };
}

export function useProfileEvents(): ProfileEventsHookReturn {
  const {
    data: myEventsData,
    isLoading: isMyEventsLoading,
    hasNextPage: hasNextMyEvents,
    fetchNextPage: fetchNextMyEvents,
    isFetchingNextPage: isFetchingNextMyEvents,
  } = useGetMyEvents(PROFILE_EVENTS_PAGE_SIZE);

  const {
    data: participatedEventsData,
    isLoading: isParticipatedEventsLoading,
    hasNextPage: hasNextParticipatedEvents,
    fetchNextPage: fetchNextParticipatedEvents,
    isFetchingNextPage: isFetchingNextParticipatedEvents,
  } = useGetParticipatedEvents(PROFILE_EVENTS_PAGE_SIZE);

  const allMyEvents = useMemo(
    () => myEventsData?.pages.flatMap((page) => page.events) ?? [],
    [myEventsData],
  );
  const allParticipatedEvents = useMemo(
    () => participatedEventsData?.pages.flatMap((page) => page.events) ?? [],
    [participatedEventsData],
  );

  const finishedParticipatedEvents = useMemo(() => {
    return allParticipatedEvents.filter((event) => {
      const state = normalizeEventState(event.state);
      return state === EventState.EVENT_STATE_FINISHED;
    });
  }, [allParticipatedEvents]);

  const upcomingEvents = useMemo(
    () => mergeUpcomingEvents(allParticipatedEvents, allMyEvents),
    [allParticipatedEvents, allMyEvents],
  );

  return {
    upcoming: {
      events: upcomingEvents,
      isLoading: isParticipatedEventsLoading || isMyEventsLoading,
      hasNextPage: hasNextParticipatedEvents || hasNextMyEvents,
      fetchNextPage: () => {
        if (hasNextParticipatedEvents) void fetchNextParticipatedEvents();
        if (hasNextMyEvents) void fetchNextMyEvents();
      },
      isFetchingNextPage: isFetchingNextParticipatedEvents || isFetchingNextMyEvents,
    },
    finished: {
      events: finishedParticipatedEvents,
      isLoading: isParticipatedEventsLoading,
      hasNextPage: hasNextParticipatedEvents,
      fetchNextPage: () => {
        void fetchNextParticipatedEvents();
      },
      isFetchingNextPage: isFetchingNextParticipatedEvents,
      totalCount: finishedParticipatedEvents.length,
    },
  };
}
