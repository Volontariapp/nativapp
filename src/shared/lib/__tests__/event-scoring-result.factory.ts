import type { EventScoringResult } from '@volontariapp/shared';

/** Resultat deterministe : points decroissants de `firstPoints` (rang 1) a `lastPoints` (dernier rang). */
export const createScoringResult = (
  firstPoints: number,
  lastPoints: number,
  count = 5,
): EventScoringResult => ({
  formulaVersion: 1,
  pool: 0,
  organizerPoints: 0,
  participants: Array.from({ length: count }, (_, index) => ({
    userId: `u-${String(index + 1)}`,
    rank: index + 1,
    points:
      count === 1
        ? firstPoints
        : Math.round(firstPoints - ((firstPoints - lastPoints) * index) / (count - 1)),
  })),
});

export const createEmptyScoringResult = (): EventScoringResult => ({
  formulaVersion: 1,
  pool: 0,
  organizerPoints: 0,
  participants: [],
});
