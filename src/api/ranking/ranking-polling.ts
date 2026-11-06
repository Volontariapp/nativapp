/**
 * Polling de secours des listes de ranking.
 *
 * Un compte neuf (ou une liste expiree) recoit un 206 : la liste est en cours de calcul et
 * l'evenement WebSocket `ranking.ready` previent l'app quand elle est prete. Cet evenement peut
 * etre perdu (socket pas encore connecte, coupure reseau). Tant que la requete reste en repli,
 * elle se relance donc d'elle-meme, de plus en plus lentement, puis abandonne : le WebSocket
 * accelere, le polling garantit.
 */

const GIVE_UP_AFTER_MS = 5 * 60_000;

/** Delai avant la prochaine relance, selon le temps passe en repli. `false` = abandon. */
const delayAfter = (elapsedMs: number): number | false => {
  if (elapsedMs >= GIVE_UP_AFTER_MS) return false;
  if (elapsedMs < 10_000) return 2_000;
  if (elapsedMs < 30_000) return 4_000;
  if (elapsedMs < 90_000) return 8_000;
  return 15_000;
};

interface PollableQuery {
  state: { data: { pages: readonly { isFallback: boolean }[] } | undefined };
}

/** Instant ou chaque requete est passee en repli (cle faible : suit la vie de la requete). */
const fallbackSince = new WeakMap<PollableQuery, number>();

/**
 * Valeur pour l'option `refetchInterval` d'une requete infinie de ranking.
 * Idempotente : React Query peut l'interroger plusieurs fois par reponse.
 */
export const fallbackRefetchInterval = (
  query: PollableQuery,
  now: number = Date.now(),
): number | false => {
  const isFallback = query.state.data?.pages[0]?.isFallback === true;
  if (!isFallback) {
    fallbackSince.delete(query);
    return false;
  }
  const since = fallbackSince.get(query) ?? now;
  fallbackSince.set(query, since);
  return delayAfter(now - since);
};
