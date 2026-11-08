import type { LeaderboardEntryWeb } from '@volontariapp/contracts';
import {
  buildDistinctionMap,
  isRankTier,
  pickBestDistinction,
  type PodiumsByScope,
} from '../rank-distinction';

const entry = (userId: string, rank: number): LeaderboardEntryWeb => ({
  userId,
  pseudo: userId,
  points: 1000 - rank,
  rank,
  distinctions: [],
});

const EMPTY: PodiumsByScope = { global: [], month: [], week: [] };

describe('isRankTier', () => {
  it('accepts the podium ranks only', () => {
    expect([1, 2, 3].every(isRankTier)).toBe(true);
    expect(isRankTier(0)).toBe(false);
    expect(isRankTier(4)).toBe(false);
  });
});

describe('pickBestDistinction', () => {
  it('returns undefined without any distinction', () => {
    expect(pickBestDistinction([])).toBeUndefined();
  });

  it('prefers the global ranking over the month, and the month over the week', () => {
    expect(
      pickBestDistinction([
        { scope: 'week', tier: 1 },
        { scope: 'month', tier: 3 },
      ]),
    ).toEqual({ scope: 'month', tier: 3 });
    expect(
      pickBestDistinction([
        { scope: 'month', tier: 1 },
        { scope: 'global', tier: 3 },
      ]),
    ).toEqual({ scope: 'global', tier: 3 });
  });

  it('keeps the best tier on the same ranking', () => {
    expect(
      pickBestDistinction([
        { scope: 'week', tier: 3 },
        { scope: 'week', tier: 2 },
      ]),
    ).toEqual({ scope: 'week', tier: 2 });
  });
});

describe('buildDistinctionMap', () => {
  it('gives each podium user the strongest distinction among the three rankings', () => {
    const map = buildDistinctionMap({
      global: [entry('alice', 1), entry('bob', 2)],
      month: [entry('carol', 1), entry('alice', 2)],
      week: [entry('carol', 2), entry('dave', 1)],
    });

    expect(map.get('alice')).toEqual({ scope: 'global', tier: 1 });
    expect(map.get('bob')).toEqual({ scope: 'global', tier: 2 });
    expect(map.get('carol')).toEqual({ scope: 'month', tier: 1 });
    expect(map.get('dave')).toEqual({ scope: 'week', tier: 1 });
  });

  it('ignores entries ranked below the podium', () => {
    const map = buildDistinctionMap({ ...EMPTY, global: [entry('alice', 1), entry('erin', 4)] });

    expect(map.has('erin')).toBe(false);
    expect(map.size).toBe(1);
  });

  it('keeps tied users at the same tier', () => {
    const map = buildDistinctionMap({ ...EMPTY, global: [entry('alice', 1), entry('bob', 1)] });

    expect(map.get('alice')).toEqual({ scope: 'global', tier: 1 });
    expect(map.get('bob')).toEqual({ scope: 'global', tier: 1 });
  });

  it('returns an empty map when nobody is ranked', () => {
    expect(buildDistinctionMap(EMPTY).size).toBe(0);
  });
});
