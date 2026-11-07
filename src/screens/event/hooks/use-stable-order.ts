import { useState } from 'react';
import { keepOrderAndAppend } from '@/shared/utils/keep-order-append';

interface OrderSnapshot<T> {
  resetKey: string;
  items: T[];
}

/**
 * Liste triee dont l'ordre ne bouge pas pendant les rafraichissements en arriere-plan : le tri
 * n'est reapplique que quand `resetKey` change (onglet, filtre, rafraichissement manuel).
 *
 * L'ordre affiche est garde dans un etat ajuste pendant le rendu (schema documente par React) :
 * un ref ecrit pendant le rendu fuirait si React rejoue ou abandonne ce rendu.
 */
export function useStableOrder<T extends { id: string }>(sorted: T[], resetKey: string): T[] {
  const [snapshot, setSnapshot] = useState<OrderSnapshot<T>>({ resetKey, items: sorted });

  const isSameOrdering = snapshot.resetKey === resetKey;
  const items = isSameOrdering ? keepOrderAndAppend(snapshot.items, sorted) : sorted;

  if (!isSameOrdering || items !== snapshot.items) {
    setSnapshot({ resetKey, items });
  }
  return items;
}
