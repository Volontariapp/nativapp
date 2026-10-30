import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { markEventHandled, readHandledEventIds } from '@/api/event/hooks/use-handled-event-ids';

export interface SwipeEventMemory {
  /** Events a ne pas proposer : photo prise a l'ouverture puis a chaque rechargement de la pile. */
  excludedIds: ReadonlySet<string>;
  markHandled: (eventId: string) => void;
  /** A appeler quand la pile est rechargee : les events traites sortent de la nouvelle liste. */
  refreshExclusions: () => void;
}

/**
 * Memoire de session de l'ecran swipe. L'exclusion ne suit pas chaque swipe en direct : retirer une
 * carte de la liste pendant qu'elle est a l'ecran decalerait les index du deck.
 */
export const useSwipeEventMemory = (): SwipeEventMemory => {
  const queryClient = useQueryClient();
  const [excludedIds, setExcludedIds] = useState<ReadonlySet<string>>(() =>
    readHandledEventIds(queryClient),
  );

  const markHandled = useCallback(
    (eventId: string): void => {
      markEventHandled(queryClient, eventId);
    },
    [queryClient],
  );

  const refreshExclusions = useCallback((): void => {
    setExcludedIds(readHandledEventIds(queryClient));
  }, [queryClient]);

  return { excludedIds, markHandled, refreshExclusions };
};
