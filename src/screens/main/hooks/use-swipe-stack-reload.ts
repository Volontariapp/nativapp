import { useEffect, useLayoutEffect, useRef } from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { rankingApi, type RankingEventsResult } from '@/api/ranking/ranking.api';
import { RELOAD_MAX_ATTEMPTS, RELOAD_POLL_INTERVAL_MS } from './constants/swipe-reload.constants';

/** Version de la liste ranking servie, ou null en mode repli. */
export const listVersionOf = (
  data: InfiniteData<RankingEventsResult> | undefined,
): string | null => {
  const first = data?.pages[0];
  return first && !first.isFallback ? first.ranking.listVersion : null;
};

interface SwipeStackReloadParams {
  /** Plus rien a proposer : pile vide, ou toutes les cartes sont passees et il n'y a pas de page suivante. */
  isStackExhausted: boolean;
  /** La pile est vide (aucun event servi) : une seule demande par ouverture, pour ne pas boucler. */
  isEmpty: boolean;
  currentListVersion: string | null;
  /** Recharge la liste ranking et renvoie sa version. */
  reloadRanking: () => Promise<string | null>;
  /** La nouvelle pile est en place : l'ecran repart de la premiere carte. */
  onReloaded: () => void;
}

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Demande un recalcul de la liste d'events quand il n'y a plus rien a proposer, puis recharge
 * jusqu'a ce que la liste change. La demande met un calcul en file : un rechargement immediat
 * renverrait encore l'ancienne liste.
 */
export const useSwipeStackReload = (params: SwipeStackReloadParams): void => {
  const { isStackExhausted, isEmpty } = params;
  const latestRef = useRef(params);
  useLayoutEffect(() => {
    latestRef.current = params;
  });
  const hasAskedWhenEmptyRef = useRef(false);
  const hasAskedAtEndRef = useRef(false);
  const isCancelledRef = useRef(false);

  useEffect(() => {
    isCancelledRef.current = false;
    return () => {
      isCancelledRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (!isStackExhausted) {
      return;
    }
    const askedRef = isEmpty ? hasAskedWhenEmptyRef : hasAskedAtEndRef;
    if (askedRef.current) {
      return;
    }
    askedRef.current = true;

    const reload = async (): Promise<void> => {
      const previousVersion = latestRef.current.currentListVersion;
      const res = await rankingApi.requestRefresh('EVENT');
      if (res.refreshThrottled) {
        return;
      }
      for (let attempt = 0; attempt < RELOAD_MAX_ATTEMPTS; attempt += 1) {
        // Rechargements dependants les uns des autres : on s'arrete des que la liste change.
        await wait(RELOAD_POLL_INTERVAL_MS);
        const version = await latestRef.current.reloadRanking();
        if (version !== previousVersion) {
          break;
        }
      }
      if (isCancelledRef.current) {
        return;
      }
      latestRef.current.onReloaded();
      // Une pile non vide peut etre rechargee a nouveau a sa fin ; une pile vide ne l'est qu'une fois.
      hasAskedAtEndRef.current = false;
    };

    reload().catch((err: unknown) => {
      console.warn('[useSwipeScreen] Ranking reload failed:', err);
    });
  }, [isStackExhausted, isEmpty]);
};
