import { useMemo, useRef } from 'react';
import { keepOrderAndAppend } from '@/shared/utils/keep-order-append';

interface OrderSnapshot<T> {
  resetKey: string;
  items: T[];
}

/**
 * Liste triee dont l'ordre ne bouge pas pendant les rafraichissements en arriere-plan : le tri
 * n'est reapplique que quand `resetKey` change (onglet, filtre, rafraichissement manuel).
 */
export function useStableOrder<T extends { id: string }>(sorted: T[], resetKey: string): T[] {
  const snapshotRef = useRef<OrderSnapshot<T>>({ resetKey, items: sorted });

  return useMemo(() => {
    const previous = snapshotRef.current;
    const items =
      previous.resetKey === resetKey ? keepOrderAndAppend(previous.items, sorted) : sorted;
    snapshotRef.current = { resetKey, items };
    return items;
  }, [sorted, resetKey]);
}
