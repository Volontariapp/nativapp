import { useCallback, useMemo, useState } from 'react';
import { useGetParticipatedEvents } from '@/api/event/hooks/use-get-participated-events';
import { useGetWishedEvents } from '@/api/event/hooks/use-get-wished-events';
import { useGetMyEvents } from '@/api/event/hooks/use-get-my-events';
import type { AppEvent } from '@/api/event/event.api';
import {
  filterByScope,
  filterByType,
  isEventCancelled,
  isEventLive,
  isEventUpcoming,
  sortEventsByEarliestUpcoming,
  type EventTypeFilter,
  type ManageTabType,
  type ParticipatedScope,
} from '../manage-hub.utils';
import { dedupeById } from '@/shared/utils/dedupe-by-id';
import { useStableOrder } from './use-stable-order';

interface EventsPage {
  events: AppEvent[];
  totalCount?: number;
}

function flattenPages(data: { pages: EventsPage[] } | undefined): AppEvent[] {
  return dedupeById(data?.pages.flatMap((page) => page.events) ?? []);
}

/**
 * Regroupe les trois listes de la page de gestion (en cours, wishlist, créés) :
 * fusion des pages, filtres, tri, compteurs, rafraîchissement et pagination.
 */
export function useManageHubData(
  activeTab: ManageTabType,
  typeFilter: EventTypeFilter,
  participatedScope: ParticipatedScope,
) {
  const participatedQuery = useGetParticipatedEvents(10);
  const wishedQuery = useGetWishedEvents(10);
  const myEventsQuery = useGetMyEvents(10);

  const activeQuery = {
    participated: participatedQuery,
    wished: wishedQuery,
    created: myEventsQuery,
  }[activeTab];

  // Les événements annulés ne doivent jamais apparaître dans "En cours"
  const participatedEvents = useMemo(
    () => flattenPages(participatedQuery.data).filter((event) => !isEventCancelled(event)),
    [participatedQuery.data],
  );
  const wishedEvents = useMemo(() => flattenPages(wishedQuery.data), [wishedQuery.data]);
  const myEvents = useMemo(() => flattenPages(myEventsQuery.data), [myEventsQuery.data]);

  const participatedCount = participatedEvents.length;
  const wishedCount = wishedQuery.data?.pages[0]?.totalCount ?? wishedEvents.length;
  const myEventsCount = myEventsQuery.data?.pages[0]?.totalCount ?? myEvents.length;

  const liveCount = useMemo(() => {
    const now = Date.now();
    return participatedEvents.filter((event) => isEventLive(event, now)).length;
  }, [participatedEvents]);

  const upcomingCount = useMemo(() => {
    const now = Date.now();
    return participatedEvents.filter((event) => isEventUpcoming(event, now)).length;
  }, [participatedEvents]);

  // Filtrage et tri : le plus proche en premier
  const sortedEvents = useMemo(() => {
    const now = Date.now();
    const lists = { participated: participatedEvents, wished: wishedEvents, created: myEvents };
    const scoped =
      activeTab === 'participated'
        ? filterByScope(lists.participated, participatedScope, now)
        : lists[activeTab];
    return [...filterByType(scoped, typeFilter)].sort((a, b) =>
      sortEventsByEarliestUpcoming(a, b, now),
    );
  }, [activeTab, participatedEvents, wishedEvents, myEvents, participatedScope, typeFilter]);

  // Le tri n'est reapplique qu'au changement d'onglet ou de filtre et a un rafraichissement manuel :
  // une mise a jour en arriere-plan (participation, WS) ajoute en bas, elle ne reordonne pas.
  const [orderGeneration, setOrderGeneration] = useState(0);
  const filteredEvents = useStableOrder(
    sortedEvents,
    `${activeTab}|${typeFilter}|${participatedScope}|${String(orderGeneration)}`,
  );

  const { refetch, hasNextPage, isFetchingNextPage, fetchNextPage } = activeQuery;

  // Le spinner du tirer-pour-rafraichir n'appartient qu'au geste de l'utilisateur, pas aux
  // rechargements en arriere-plan (`isRefetching`).
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setIsManualRefreshing(true);
    setOrderGeneration((previous) => previous + 1);
    void Promise.resolve(refetch()).finally(() => {
      setIsManualRefreshing(false);
    });
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    participatedEvents,
    filteredEvents,
    participatedCount,
    wishedCount,
    myEventsCount,
    liveCount,
    upcomingCount,
    onRefresh,
    isRefreshing: isManualRefreshing,
    handleEndReached,
    currentIsInitialLoading: activeQuery.isLoading,
    currentIsFetchingNext: isFetchingNextPage,
  };
}
