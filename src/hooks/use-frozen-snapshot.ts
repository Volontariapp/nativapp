import { useState } from 'react';

/**
 * Garde la premiere valeur prete tant que `isActive`, puis l'oublie. Sert a figer un ordre le temps
 * qu'une liste est ouverte : sans cela, une ligne changerait de place des qu'une donnee dont elle
 * depend bouge (ex. un abonnement), sous le doigt de l'utilisateur.
 */
export const useFrozenSnapshot = <T>(value: T, isReady: boolean, isActive: boolean): T | null => {
  const [snapshot, setSnapshot] = useState<{ value: T } | null>(null);

  // Ajustement d'etat pendant le rendu (pattern documente par React) : pas de rendu intermediaire.
  if (!isActive && snapshot !== null) {
    setSnapshot(null);
  } else if (isActive && isReady && snapshot === null) {
    setSnapshot({ value });
  }

  return isActive ? (snapshot?.value ?? null) : null;
};
