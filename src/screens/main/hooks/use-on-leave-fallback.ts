import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Appelle `onLeave` quand la liste ranking prend le relais de la liste de repli (passage de
 * `isFallback` de true a false). Avec le polling de secours, ce basculement peut arriver pendant
 * que l'utilisateur parcourt la pile de repli : l'ecran doit alors repartir de la premiere carte.
 */
export const useOnLeaveFallback = (isFallback: boolean, onLeave: () => void): void => {
  const onLeaveRef = useRef(onLeave);
  useLayoutEffect(() => {
    onLeaveRef.current = onLeave;
  });
  const wasFallbackRef = useRef(isFallback);

  useEffect(() => {
    if (wasFallbackRef.current && !isFallback) {
      onLeaveRef.current();
    }
    wasFallbackRef.current = isFallback;
  }, [isFallback]);
};
