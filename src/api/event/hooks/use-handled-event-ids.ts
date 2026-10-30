import type { QueryClient } from '@tanstack/react-query';

export const HANDLED_EVENT_IDS_QUERY_KEY = ['feed', 'handled-event-ids'] as const;

const NO_EVENT_IDS: readonly string[] = [];

/**
 * Events souhaites, auxquels on participe ou passes pendant la session. La liste ranking stockee
 * cote serveur ne le sait qu'apres son prochain calcul : l'ecran swipe s'en sert pour ne jamais
 * reproposer un de ces events. Aucun observateur : la valeur est lue a la demande.
 */
export const markEventHandled = (queryClient: QueryClient, eventId: string): void => {
  queryClient.setQueryDefaults(HANDLED_EVENT_IDS_QUERY_KEY, { gcTime: Infinity });
  queryClient.setQueryData<readonly string[]>(HANDLED_EVENT_IDS_QUERY_KEY, (previous) => {
    const current = previous ?? NO_EVENT_IDS;
    return current.includes(eventId) ? current : [...current, eventId];
  });
};

export const readHandledEventIds = (queryClient: QueryClient): ReadonlySet<string> =>
  new Set(queryClient.getQueryData<readonly string[]>(HANDLED_EVENT_IDS_QUERY_KEY) ?? NO_EVENT_IDS);
