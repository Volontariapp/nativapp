import { useMemo } from 'react';
import type { CalendarProps } from 'react-native-calendars';
import { EventState } from '@volontariapp/contracts';
import { useGetMyEvents } from '@/api/event/hooks/use-get-my-events';
import { useGetParticipatedEvents } from '@/api/event/hooks/use-get-participated-events';
import { useGetWishedEvents } from '@/api/event/hooks/use-get-wished-events';
import type { AppTheme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import { normalizeEventState } from '@/shared/lib/event-mappers.utils';
import { isEventDatePast } from '@/components/event/event-status.utils';

type MarkedDates = NonNullable<CalendarProps['markedDates']>;

interface ProfileEventsHookReturn {
  participated: {
    events: AppEvent[];
    isLoading: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    isFetchingNextPage: boolean;
    totalCount: number;
  };
  finished: {
    events: AppEvent[];
    isLoading: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    isFetchingNextPage: boolean;
    totalCount: number;
  };
  created: {
    events: AppEvent[];
    isLoading: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    isFetchingNextPage: boolean;
    totalCount: number;
  };
  wished: {
    events: AppEvent[];
    isLoading: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    isFetchingNextPage: boolean;
  };
  markedDates: MarkedDates;
}

export function useProfileEvents(theme: AppTheme): ProfileEventsHookReturn {
  const {
    data: myEventsData,
    isLoading: isMyEventsLoading,
    hasNextPage: hasNextMyEvents,
    fetchNextPage: fetchNextMyEvents,
    isFetchingNextPage: isFetchingNextMyEvents,
  } = useGetMyEvents(2);

  const {
    data: participatedEventsData,
    isLoading: isParticipatedEventsLoading,
    hasNextPage: hasNextParticipatedEvents,
    fetchNextPage: fetchNextParticipatedEvents,
    isFetchingNextPage: isFetchingNextParticipatedEvents,
  } = useGetParticipatedEvents(2);

  const {
    data: wishedEventsData,
    isLoading: isWishedEventsLoading,
    hasNextPage: hasNextWishedEvents,
    fetchNextPage: fetchNextWishedEvents,
    isFetchingNextPage: isFetchingNextWishedEvents,
  } = useGetWishedEvents(2);

  const allMyEvents = useMemo(
    () => myEventsData?.pages.flatMap((page) => page.events) ?? [],
    [myEventsData],
  );
  const allParticipatedEvents = useMemo(
    () => participatedEventsData?.pages.flatMap((page) => page.events) ?? [],
    [participatedEventsData],
  );
  const allWishedEvents = useMemo(
    () => wishedEventsData?.pages.flatMap((page) => page.events) ?? [],
    [wishedEventsData],
  );

  const upcomingParticipatedEvents = useMemo(() => {
    return allParticipatedEvents.filter((event) => {
      const state = normalizeEventState(event.state);
      const isPast = isEventDatePast(event.endAt, event.startAt);
      return (
        state !== EventState.EVENT_STATE_FINISHED &&
        state !== EventState.EVENT_STATE_CANCELLED &&
        !isPast
      );
    });
  }, [allParticipatedEvents]);

  const finishedParticipatedEvents = useMemo(() => {
    return allParticipatedEvents.filter((event) => {
      const state = normalizeEventState(event.state);
      return state === EventState.EVENT_STATE_FINISHED;
    });
  }, [allParticipatedEvents]);

  const markedDates = useMemo(() => {
    const dates: MarkedDates = {};

    allParticipatedEvents.forEach((event) => {
      if (event.startAt) {
        const dateStr = event.startAt.split('T')[0];
        if (dateStr != null) {
          dates[dateStr] = {
            customStyles: {
              container: {
                borderWidth: 2,
                borderColor: theme.colors.warning,
                borderRadius: 20,
              },
              text: {
                color: theme.colors.text,
                fontWeight: 'bold',
              },
            },
          };
        }
      }
    });

    allMyEvents.forEach((event) => {
      if (event.startAt) {
        const dateStr = event.startAt.split('T')[0];
        if (dateStr != null) {
          dates[dateStr] = {
            customStyles: {
              container: {
                borderWidth: 2,
                borderColor: theme.colors.primarySocio,
                borderRadius: 20,
              },
              text: {
                color: theme.colors.text,
                fontWeight: 'bold',
              },
            },
          };
        }
      }
    });

    return dates;
  }, [allParticipatedEvents, allMyEvents, theme]);

  return {
    participated: {
      events: upcomingParticipatedEvents,
      isLoading: isParticipatedEventsLoading,
      hasNextPage: hasNextParticipatedEvents,
      fetchNextPage: () => {
        void fetchNextParticipatedEvents();
      },
      isFetchingNextPage: isFetchingNextParticipatedEvents,
      totalCount: upcomingParticipatedEvents.length,
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
    created: {
      events: allMyEvents,
      isLoading: isMyEventsLoading,
      hasNextPage: hasNextMyEvents,
      fetchNextPage: () => {
        void fetchNextMyEvents();
      },
      isFetchingNextPage: isFetchingNextMyEvents,
      totalCount: myEventsData?.pages[0]?.totalCount ?? 0,
    },
    wished: {
      events: allWishedEvents,
      isLoading: isWishedEventsLoading,
      hasNextPage: hasNextWishedEvents,
      fetchNextPage: () => {
        void fetchNextWishedEvents();
      },
      isFetchingNextPage: isFetchingNextWishedEvents,
    },
    markedDates,
  };
}
