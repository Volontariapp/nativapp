import { lightTheme } from '@/shared/themes/theme';
import { rankDistinctionLabel, rankIconKind, rankPaletteKeys } from '../rank-palette';
import type { RankDistinction, RankTier } from '../rank.types';

const SCOPES: RankDistinction['scope'][] = ['global', 'month', 'week'];
const TIERS: RankTier[] = [1, 2, 3];

describe('rank palette', () => {
  it('only names colors that exist in the theme, for every ranking and place', () => {
    for (const scope of SCOPES) {
      for (const tier of TIERS) {
        const keys = rankPaletteKeys({ scope, tier });
        expect(lightTheme.colors[keys.border]).toBeDefined();
        expect(lightTheme.colors[keys.background]).toBeDefined();
        expect(lightTheme.colors[keys.text]).toBeDefined();
      }
    }
  });

  it('uses metals for the global ranking, gems for the month and flames for the week', () => {
    expect(rankPaletteKeys({ scope: 'global', tier: 1 }).border).toBe('gold');
    expect(rankPaletteKeys({ scope: 'global', tier: 2 }).border).toBe('silver');
    expect(rankPaletteKeys({ scope: 'global', tier: 3 }).border).toBe('bronze');
    expect(rankPaletteKeys({ scope: 'month', tier: 1 }).border).toBe('diamond');
    expect(rankPaletteKeys({ scope: 'month', tier: 2 }).border).toBe('emerald');
    expect(rankPaletteKeys({ scope: 'month', tier: 3 }).border).toBe('ruby');
    expect(rankPaletteKeys({ scope: 'week', tier: 1 }).border).toBe('flame');
    expect(rankPaletteKeys({ scope: 'week', tier: 3 }).border).toBe('ember');
  });

  it('draws a crown for the global first, a medal for the next, a gem for the month, a flame for the week', () => {
    expect(rankIconKind({ scope: 'global', tier: 1 })).toBe('crown');
    expect(rankIconKind({ scope: 'global', tier: 2 })).toBe('medal');
    expect(rankIconKind({ scope: 'month', tier: 1 })).toBe('gem');
    expect(rankIconKind({ scope: 'week', tier: 2 })).toBe('flame');
  });

  it('writes a label with the place and the ranking', () => {
    expect(rankDistinctionLabel({ scope: 'global', tier: 1 })).toBe('Premier du classement');
    expect(rankDistinctionLabel({ scope: 'month', tier: 2 })).toBe('Deuxième du mois');
    expect(rankDistinctionLabel({ scope: 'week', tier: 3 })).toBe('Troisième de la semaine');
  });
});
