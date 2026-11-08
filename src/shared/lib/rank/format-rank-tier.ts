/** Rang exact jusqu'à ce seuil ; au-delà, un palier qui évite d'afficher une précision inutile. */
export const EXACT_RANK_LIMIT = 100;

/** Paliers croissants affichés au-delà du rang exact. */
export const RANK_TIER_LIMITS: readonly number[] = [500, 1000, 5000, 10000];

const groupThousands = (value: number): string =>
  String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** « N° 12 » pour les 100 premiers, puis « Top 500 », « Top 1 000 », « Top 5 000 », « Top 10 000 ». */
export const formatRankTier = (rank: number): string => {
  if (rank <= EXACT_RANK_LIMIT) return `N° ${String(rank)}`;
  const limit = RANK_TIER_LIMITS.find((candidate) => rank <= candidate);
  return limit === undefined ? 'Classé' : `Top ${groupThousands(limit)}`;
};
