import { useEffect, useMemo } from 'react';
import { useGetParticipatedEvents } from '@/api/event/hooks/use-get-participated-events';
import type { AppEvent } from '@/api/event/event.api';

const PARTICIPATED_PAGE_SIZE = 50;
const MAX_PARTICIPATED_PAGES = 5;

export interface CappedParticipatedEvents {
  events: AppEvent[];
  /** Vrai tant que la premiere page ou une page suivante (dans la limite du plafond) est attendue. */
  isLoading: boolean;
}

const canLoadMore = (hasNextPage: boolean, loadedPages: number): boolean =>
  hasNextPage && loadedPages < MAX_PARTICIPATED_PAGES;

/**
 * Charge les participations de l'utilisateur page apres page jusqu'a MAX_PARTICIPATED_PAGES.
 * L'endpoint participated/me n'offre ni filtre d'etat ni total d'evenements termines : le
 * nombre d'evenements termines ne se deduit pas d'une page partielle, et le plafond borne le
 * cout reseau.
 */
export const useCappedParticipatedEvents = (): CappedParticipatedEvents => {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useGetParticipatedEvents(PARTICIPATED_PAGE_SIZE);
  const loadedPages = data === undefined ? 0 : data.pages.length;
  const hasMore = canLoadMore(hasNextPage, loadedPages);

  useEffect(() => {
    if (hasMore && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasMore, isFetchingNextPage, fetchNextPage]);

  const events = useMemo(
    () => (data === undefined ? [] : data.pages.flatMap((page) => page.events)),
    [data],
  );

  return { events, isLoading: isLoading || hasMore };
};
