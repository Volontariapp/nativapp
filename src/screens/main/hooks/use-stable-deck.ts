import { useState } from 'react';
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
 *
 * La pile affichee est gardee dans un etat ajuste pendant le rendu (schema documente par React) :
 * un ref ecrit pendant le rendu fuirait si React rejoue ou abandonne ce rendu.
 */
export function useStableDeck(incoming: AppEvent[], generation: number): AppEvent[] {
  const [snapshot, setSnapshot] = useState<DeckSnapshot>({ generation, cards: incoming });

  const isSameGeneration = snapshot.generation === generation;
  const cards = isSameGeneration ? mergeDeck(snapshot.cards, incoming) : incoming;

  if (!isSameGeneration || cards !== snapshot.cards) {
    setSnapshot({ generation, cards });
  }
  return cards;
}
