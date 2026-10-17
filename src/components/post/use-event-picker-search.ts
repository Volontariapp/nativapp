import { useEffect, useMemo, useState } from 'react';
import { EventState } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import { useGetEvents } from '@/api/event/hooks/use-get-events';

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 20;
const LINKABLE_STATES = [
  EventState.EVENT_STATE_PUBLISHED,
  EventState.EVENT_STATE_IN_PROGRESS,
  EventState.EVENT_STATE_FINISHED,
];

interface EventPickerSearch {
  events: AppEvent[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

/**
 * Liste paginee de tous les evenements que l'on peut lier a un post, filtree par nom cote
 * serveur (`searchTerm`) apres un court delai de saisie.
 */
export const useEventPickerSearch = (query: string): EventPickerSearch => {
  const [debouncedQuery, setDebouncedQuery] = useState(() => query.trim());

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useGetEvents({
    searchTerm: debouncedQuery === '' ? undefined : debouncedQuery,
    statuses: LINKABLE_STATES,
    limit: PAGE_SIZE,
  });

  const events = useMemo(() => data?.pages.flatMap((page) => page.events) ?? [], [data]);

  return {
    events,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: () => {
      void fetchNextPage();
    },
  };
};
