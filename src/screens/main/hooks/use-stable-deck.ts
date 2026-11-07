import { useMemo, useRef } from 'react';
import type { AppEvent } from '@/api/event/event.api';

/**
 * Fusionne la liste servie dans la pile deja affichee, sans jamais la retirer ni la reordonner :
 * les cartes connues gardent leur place (et prennent les donnees fraiches), les nouvelles vont en
 * bas. Le deck de swipe garde son propre index : une carte qui change de rang sous lui decale
 * toutes les suivantes.
 */
export function mergeDeck(current: readonly AppEvent[], incoming: readonly AppEvent[]): AppEvent[] {
  const freshById = new Map(incoming.map((event) => [event.id, event]));
  const known = new Set(current.map((event) => event.id));

  const refreshed = current.map((event) => freshById.get(event.id) ?? event);
  const appended = incoming.filter((event) => !known.has(event.id));

  const isUnchanged =
    appended.length === 0 && refreshed.every((event, index) => event === current[index]);
  return isUnchanged ? (current as AppEvent[]) : [...refreshed, ...appended];
}

interface DeckSnapshot {
  generation: number;
  cards: AppEvent[];
}

/**
 * Pile stable pour le deck de swipe. `generation` change quand la pile est volontairement
 * remplacee (rechargement en fin de pile, bascule repli vers ranking) : la liste servie repart
 * alors de zero. Entre deux, un rafraichissement en arriere-plan n'ajoute que des cartes en bas.
 */
export function useStableDeck(incoming: AppEvent[], generation: number): AppEvent[] {
  const snapshotRef = useRef<DeckSnapshot>({ generation, cards: incoming });

  return useMemo(() => {
    const previous = snapshotRef.current;
    const cards =
      previous.generation === generation ? mergeDeck(previous.cards, incoming) : incoming;
    snapshotRef.current = { generation, cards };
    return cards;
  }, [incoming, generation]);
}
