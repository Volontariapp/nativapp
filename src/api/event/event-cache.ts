import type { QueryClient } from '@tanstack/react-query';

/**
 * Listes d'events affichees dans l'app : carte et repli du swipe (`events`), evenements crees,
 * wishlist et participations. Elles partagent la meme source, donc elles se rafraichissent ensemble.
 */
export const EVENT_LIST_QUERY_KEYS = [
  ['events'],
  ['my-events'],
  ['wished-events'],
  ['participated-events'],
] as const;

export const invalidateEventLists = (queryClient: QueryClient): void => {
  EVENT_LIST_QUERY_KEYS.forEach((queryKey) => {
    void queryClient.invalidateQueries({ queryKey });
  });
};
