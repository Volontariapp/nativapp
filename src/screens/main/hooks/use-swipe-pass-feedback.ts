import { useCallback, useRef } from 'react';
import { rankingApi } from '@/api/ranking/ranking.api';

const MAX_PASS_BATCH_SIZE = 50;
const PASS_BATCH_TRIGGER_SIZE = 5;

export interface SwipePassFeedback {
  /** Ajoute un PASS au tampon ; un lot part des que 5 PASS sont en attente. */
  queuePass: (eventId: string) => void;
  /** Envoie le tampon (passage en arriere-plan, demontage). */
  flushPendingPass: () => Promise<void>;
}

/** Tampon de PASS : envoye par lots de 5, a l'arriere-plan et au demontage (gere par l'ecran). */
export const useSwipePassFeedback = (): SwipePassFeedback => {
  const pendingPassIdsRef = useRef<string[]>([]);
  const isFlushingPassRef = useRef(false);

  const flushPendingPass = useCallback(async (): Promise<void> => {
    if (isFlushingPassRef.current || pendingPassIdsRef.current.length === 0) {
      return;
    }
    isFlushingPassRef.current = true;
    const toSend = pendingPassIdsRef.current.slice(0, MAX_PASS_BATCH_SIZE);
    try {
      await rankingApi.recordFeedback(toSend);
      const sentSet = new Set(toSend);
      pendingPassIdsRef.current = pendingPassIdsRef.current.filter((id) => !sentSet.has(id));
      if (pendingPassIdsRef.current.length >= PASS_BATCH_TRIGGER_SIZE) {
        isFlushingPassRef.current = false;
        void flushPendingPass();
        return;
      }
    } catch (err) {
      console.warn('[useSwipeScreen] Failed to record PASS feedback, keeping in buffer:', err);
    } finally {
      isFlushingPassRef.current = false;
    }
  }, []);

  const queuePass = useCallback(
    (eventId: string): void => {
      pendingPassIdsRef.current.push(eventId);
      if (pendingPassIdsRef.current.length >= PASS_BATCH_TRIGGER_SIZE) {
        void flushPendingPass();
      }
    },
    [flushPendingPass],
  );

  return { queuePass, flushPendingPass };
};
