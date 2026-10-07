/**
 * Corps d'une création dont l'`idempotencyKey` est facultative côté appelant : la couche API
 * en génère une quand elle est absente. Un formulaire qui veut qu'un nouvel envoi après
 * échec reste idempotent fournit la même clé à chaque tentative.
 */
export type WithOptionalIdempotencyKey<T extends { idempotencyKey: string }> = Omit<
  T,
  'idempotencyKey'
> & { idempotencyKey?: string };
