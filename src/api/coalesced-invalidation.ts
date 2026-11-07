import type { QueryClient, QueryKey } from '@tanstack/react-query';

const timers = new WeakMap<QueryClient, Map<string, ReturnType<typeof setTimeout>>>();

/**
 * Invalide `queryKey` une seule fois, `delayMs` apres la derniere demande. Une rafale d'actions
 * (plusieurs "Participer" a la suite) ne recharge la liste qu'une fois la rafale terminee.
 */
export const scheduleCoalescedInvalidation = (
  queryClient: QueryClient,
  queryKey: QueryKey,
  delayMs: number,
): void => {
  const clientTimers = timers.get(queryClient) ?? new Map<string, ReturnType<typeof setTimeout>>();
  timers.set(queryClient, clientTimers);

  const id = JSON.stringify(queryKey);
  const pending = clientTimers.get(id);
  if (pending !== undefined) {
    clearTimeout(pending);
  }
  clientTimers.set(
    id,
    setTimeout(() => {
      clientTimers.delete(id);
      void queryClient.invalidateQueries({ queryKey });
    }, delayMs),
  );
};
