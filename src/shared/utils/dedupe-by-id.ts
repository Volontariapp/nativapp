/**
 * Retire les doublons d'une liste a plat par identifiant : le premier exemplaire est conserve et
 * l'ordre reste stable. Utile pour les listes paginees par offset, ou un item peut reapparaitre
 * sur la page suivante quand la liste bouge entre deux requetes.
 */
export const dedupeById = <T extends { id: string }>(items: readonly T[]): T[] => {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
};
