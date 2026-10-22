import { useCallback, useRef } from 'react';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

export type SwipeDirection = 'right' | 'left';

/**
 * Pilote une carte de wishlist glissable (ReanimatedSwipeable) : le glissement est géré par la
 * librairie, ce hook ne fait que déclencher l'action une seule fois et rouvrir la carte en cas d'échec.
 * `right` = participer (glissement vers la droite), `left` = retirer (glissement vers la gauche).
 */
export function useWishedCardSwipe(onCommit: (direction: SwipeDirection) => void | Promise<void>) {
  const swipeRef = useRef<SwipeableMethods | null>(null);
  const committedRef = useRef(false);

  const commit = useCallback(
    async (direction: SwipeDirection) => {
      if (committedRef.current) return;
      committedRef.current = true;
      try {
        await onCommit(direction);
      } catch {
        // Le cache a été restauré par la mutation : la carte doit revenir en place.
        committedRef.current = false;
        swipeRef.current?.close();
      }
    },
    [onCommit],
  );

  return { swipeRef, commit };
}
