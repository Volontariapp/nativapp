import { useEffect, useState } from 'react';
import { authExpiredBus, syncPendingBus } from '../services/event-bus.service';

/**
 * Duree maximale de l'indicateur "Synchronisation en cours". Un evenement WebSocket de fallback
 * l'eteint normalement; si cet evenement est perdu (socket coupe, app en arriere-plan), le
 * delai evite un indicateur bloque jusqu'au redemarrage de l'app.
 */
const SYNC_PENDING_TIMEOUT_MS = 20_000;

/** Etat de l'indicateur de synchronisation, allume par un 206 et eteint par un evenement, un delai ou la fin de session. */
export const useSyncPendingIndicator = (): boolean => {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const stop = (): void => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      setIsSyncing(false);
    };

    const unsubscribeSync = syncPendingBus.subscribe((pending) => {
      if (!pending) {
        stop();
        return;
      }
      if (timer !== null) {
        clearTimeout(timer);
      }
      setIsSyncing(true);
      timer = setTimeout(stop, SYNC_PENDING_TIMEOUT_MS);
    });
    const unsubscribeAuth = authExpiredBus.subscribe(stop);

    return (): void => {
      if (timer !== null) {
        clearTimeout(timer);
      }
      unsubscribeSync();
      unsubscribeAuth();
    };
  }, []);

  return isSyncing;
};
