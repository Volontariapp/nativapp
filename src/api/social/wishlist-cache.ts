import type { QueryClient } from '@tanstack/react-query';

export const WISHED_EVENTS_QUERY_KEY = ['wished-events'] as const;

/** Attente apres la derniere modification avant de recharger la wishlist depuis le serveur. */
const WISHLIST_REFRESH_DELAY_MS = 300;

interface WishedPage {
  totalCount?: number;
  events: { id: string }[];
}

interface WishedData {
  pages?: WishedPage[];
}

/**
 * Retire un event des pages en cache de la wishlist. Le compteur total ne baisse que du nombre
 * d'events reellement retires : retirer un event absent de la liste ne doit pas decaler le
 * compteur, sinon la pagination s'arrete trop tot.
 */
export const withoutWishedEvent = (data: unknown, eventId: string): unknown => {
  const typed = data as WishedData | undefined;
  if (typed?.pages === undefined) {
    return data;
  }
  const removed = typed.pages.reduce(
    (count, page) => count + page.events.filter((event) => event.id === eventId).length,
    0,
  );
  if (removed === 0) {
    return data;
  }
  return {
    ...typed,
    pages: typed.pages.map((page) => ({
      ...page,
      events: page.events.filter((event) => event.id !== eventId),
      ...(page.totalCount !== undefined && { totalCount: Math.max(0, page.totalCount - removed) }),
    })),
  };
};

/** Retrait optimiste : annule les chargements en cours pour qu'ils n'ecrasent pas le retrait. */
export const removeWishedEventOptimistically = async (
  queryClient: QueryClient,
  eventId: string,
): Promise<void> => {
  await queryClient.cancelQueries({ queryKey: WISHED_EVENTS_QUERY_KEY });
  queryClient.setQueriesData({ queryKey: WISHED_EVENTS_QUERY_KEY }, (old: unknown) =>
    withoutWishedEvent(old, eventId),
  );
};

const refreshTimers = new WeakMap<QueryClient, ReturnType<typeof setTimeout>>();

/**
 * Recharge la wishlist depuis le serveur une fois les actions terminees. Une rafale d'actions
 * (plusieurs "Participer" a la suite) ne declenche qu'un seul rechargement : le retrait optimiste
 * est confirme ou corrige par le serveur, sans rollback sur un instantane devenu perime.
 */
export const scheduleWishlistRefresh = (queryClient: QueryClient): void => {
  const pending = refreshTimers.get(queryClient);
  if (pending !== undefined) {
    clearTimeout(pending);
  }
  refreshTimers.set(
    queryClient,
    setTimeout(() => {
      refreshTimers.delete(queryClient);
      void queryClient.invalidateQueries({ queryKey: WISHED_EVENTS_QUERY_KEY });
    }, WISHLIST_REFRESH_DELAY_MS),
  );
};
