import type { AppThemeColors } from '@/shared/themes/theme';
import type { RankDistinction, RankIconKind, RankTier } from './rank.types';

/** Les trois couleurs d'un cadre, désignées par leur nom dans le thème (jamais par un code couleur). */
export interface RankPaletteKeys {
  readonly border: keyof AppThemeColors;
  readonly background: keyof AppThemeColors;
  readonly text: keyof AppThemeColors;
}

const GOLD: RankPaletteKeys = { border: 'gold', background: 'goldBackground', text: 'goldText' };
const SILVER: RankPaletteKeys = {
  border: 'silver',
  background: 'silverBackground',
  text: 'silverText',
};
const BRONZE: RankPaletteKeys = {
  border: 'bronze',
  background: 'bronzeBackground',
  text: 'bronzeText',
};
const DIAMOND: RankPaletteKeys = {
  border: 'diamond',
  background: 'diamondBackground',
  text: 'diamondText',
};
const EMERALD: RankPaletteKeys = {
  border: 'emerald',
  background: 'emeraldBackground',
  text: 'emeraldText',
};
const RUBY: RankPaletteKeys = { border: 'ruby', background: 'rubyBackground', text: 'rubyText' };
const FLAME: RankPaletteKeys = {
  border: 'flame',
  background: 'flameBackground',
  text: 'flameText',
};
const EMBER: RankPaletteKeys = {
  border: 'ember',
  background: 'emberBackground',
  text: 'emberText',
};

/** Global : métaux. Mois : gemmes. Semaine : flammes. */
const PALETTE: Record<RankDistinction['scope'], Record<RankTier, RankPaletteKeys>> = {
  global: { 1: GOLD, 2: SILVER, 3: BRONZE },
  month: { 1: DIAMOND, 2: EMERALD, 3: RUBY },
  week: { 1: FLAME, 2: SILVER, 3: EMBER },
};

export const rankPaletteKeys = (distinction: RankDistinction): RankPaletteKeys =>
  PALETTE[distinction.scope][distinction.tier];

export const rankIconKind = (distinction: RankDistinction): RankIconKind => {
  if (distinction.scope === 'month') return 'gem';
  if (distinction.scope === 'week') return 'flame';
  return distinction.tier === 1 ? 'crown' : 'medal';
};

/** Nom de chaque distinction, tel qu'il est affiché : métaux (global), gemmes (mois), flammes (semaine). */
const NAMES: Record<RankDistinction['scope'], Record<RankTier, string>> = {
  global: { 1: "Couronne d'or", 2: "Médaille d'argent", 3: 'Médaille de bronze' },
  month: { 1: 'Diamant', 2: 'Émeraude', 3: 'Rubis' },
  week: { 1: 'Flamme dorée', 2: 'Flamme argentée', 3: 'Flamme de braise' },
};

/** Nom affiché dans l'étiquette du cadre et lu par les lecteurs d'écran. */
export const rankDistinctionLabel = (distinction: RankDistinction): string =>
  NAMES[distinction.scope][distinction.tier];
