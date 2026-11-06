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
  // Incremente a chaque nouveau 206 : relance le compte a rebours meme si l'indicateur est deja allume.
  const [signalCount, setSignalCount] = useState(0);

  useEffect(() => {
    const unsubscribeSync = syncPendingBus.subscribe((pending) => {
      setIsSyncing(pending);
      if (pending) {
        setSignalCount((count) => count + 1);
      }
    });
    const unsubscribeAuth = authExpiredBus.subscribe(() => {
      setIsSyncing(false);
    });

    return (): void => {
      unsubscribeSync();
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!isSyncing) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setIsSyncing(false);
    }, SYNC_PENDING_TIMEOUT_MS);
    return (): void => {
      clearTimeout(timer);
    };
  }, [isSyncing, signalCount]);

  return isSyncing;
};
