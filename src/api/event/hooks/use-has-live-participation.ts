import { useGetMyEvents } from './use-get-my-events';
import { useGetParticipatedEvents } from './use-get-participated-events';
import { selectJoinableLiveEvents } from '../live-events.utils';

/** Meme limite que ManageHub et que l'ecran direct : les requetes partagent le cache React Query. */
const MY_EVENTS_PAGE_LIMIT = 10;

/**
 * Vrai si une participation ou un evenement organise par l'utilisateur est en direct (D1, D20).
 * Aucune requete tant que `enabled` est faux.
 */
export function useHasLiveParticipation(enabled: boolean): boolean {
  const participatedQuery = useGetParticipatedEvents(MY_EVENTS_PAGE_LIMIT, { enabled });
  const myEventsQuery = useGetMyEvents(MY_EVENTS_PAGE_LIMIT, { enabled });

  if (!enabled) return false;

  const events = [
    ...(myEventsQuery.data?.pages.flatMap((page) => page.events) ?? []),
    ...(participatedQuery.data?.pages.flatMap((page) => page.events) ?? []),
  ];
  return selectJoinableLiveEvents(events, Date.now()).length > 0;
}
