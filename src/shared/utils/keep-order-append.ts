/**
 * Garde l'ordre deja affiche : les elements encore presents gardent leur place (et prennent les
 * donnees fraiches), ceux qui ont disparu sortent, les nouveaux vont en bas. Evite qu'un
 * rafraichissement en arriere-plan fasse remonter un element en tete de liste.
 */
export function keepOrderAndAppend<T extends { id: string }>(
  current: readonly T[],
  incoming: readonly T[],
): T[] {
  const incomingById = new Map(incoming.map((item) => [item.id, item]));
  const currentIds = new Set(current.map((item) => item.id));

  const kept = current.flatMap((item) => {
    const fresh = incomingById.get(item.id);
    return fresh === undefined ? [] : [fresh];
  });
  const appended = incoming.filter((item) => !currentIds.has(item.id));

  const isUnchanged =
    appended.length === 0 &&
    kept.length === current.length &&
    kept.every((item, index) => item === current[index]);
  return isUnchanged ? (current as T[]) : [...kept, ...appended];
}
