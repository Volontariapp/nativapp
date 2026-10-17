export interface ImpactRank {
  name: string;
  /** Points d'impact cumules a partir desquels le rang est debloque. */
  minPoints: number;
  tagline: string;
}

export interface ImpactRankStatus {
  points: number;
  current: ImpactRank;
  /** Null quand le rang maximum est atteint. */
  next: ImpactRank | null;
  pointsToNext: number;
  /** Avancement dans le rang courant, de 0 a 1 (1 au rang maximum). */
  ratio: number;
  isMax: boolean;
}

const ROOKIE_HELPER: ImpactRank = {
  name: 'ROOKIE HELPER',
  minPoints: 0,
  tagline: 'Tu viens d’arriver. Les autres comptent déjà sur toi.',
};

/**
 * Echelle des rangs, calee sur 100 points par evenement (valeur par defaut du formulaire de
 * creation). Source unique : la frise du feed et la page des rangs la lisent, ajuster ici.
 */
export const IMPACT_RANKS: readonly ImpactRank[] = [
  ROOKIE_HELPER,
  { name: 'FIELD VOLUNTEER', minPoints: 100, tagline: 'Tu es sur le terrain, et ça se voit.' },
  { name: 'COMMUNITY RANGER', minPoints: 300, tagline: 'Tu fédères, la communauté avance.' },
  { name: 'IMPACT WARRIOR', minPoints: 700, tagline: 'Chaque mission change quelque chose.' },
  { name: 'CHANGE MAKER', minPoints: 1500, tagline: 'Tu protèges ce que les autres oublient.' },
  { name: 'CLEANER MASTER', minPoints: 3000, tagline: 'Aucune mission ne te résiste.' },
  { name: 'HOPE GUARDIAN', minPoints: 5500, tagline: 'Tu veilles, les autres te le rendent.' },
  { name: 'WORLD DEFENDER', minPoints: 9000, tagline: 'Ton impact se voit depuis l’espace.' },
  {
    name: 'LIVING LEGEND',
    minPoints: 15000,
    tagline: 'Ton nom se murmure sur toutes les missions.',
  },
  {
    name: 'ATLAS TITAN',
    minPoints: 25000,
    tagline: 'Le sommet. Le monde te doit une fière chandelle.',
  },
];

const sanitizePoints = (value: number): number => (Number.isFinite(value) ? Math.max(0, value) : 0);

export type ImpactRankState = 'unlocked' | 'current' | 'locked';

/** Etat d'un rang par rapport au rang courant de l'utilisateur. */
export const getRankState = (rank: ImpactRank, current: ImpactRank): ImpactRankState => {
  if (rank.minPoints === current.minPoints) return 'current';
  return rank.minPoints < current.minPoints ? 'unlocked' : 'locked';
};

/** Espace simple entre les milliers : independant de l'ICU du moteur JavaScript. */
export const formatPoints = (value: number): string =>
  String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export function getImpactRankStatus(totalPoints: number): ImpactRankStatus {
  const points = sanitizePoints(totalPoints);
  const current = IMPACT_RANKS.reduce(
    (best, rank) => (rank.minPoints <= points ? rank : best),
    ROOKIE_HELPER,
  );
  const next = IMPACT_RANKS.find((rank) => rank.minPoints > points) ?? null;

  if (next === null) {
    return { points, current, next, pointsToNext: 0, ratio: 1, isMax: true };
  }

  return {
    points,
    current,
    next,
    pointsToNext: next.minPoints - points,
    ratio: (points - current.minPoints) / (next.minPoints - current.minPoints),
    isMax: false,
  };
}
