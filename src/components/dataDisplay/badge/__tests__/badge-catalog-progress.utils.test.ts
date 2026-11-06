import { buildBadgeCatalog } from '../badge-catalog.utils';
import type { BadgeCatalogEntry } from '../badge-catalog.types';
import { createBadgeProgress } from './badge-progress.factory';

const allEntries = (catalog: ReturnType<typeof buildBadgeCatalog>): BadgeCatalogEntry[] =>
  catalog.sections.flatMap((section) => section.data);

const entryOf = (catalog: ReturnType<typeof buildBadgeCatalog>, variant: string): BadgeCatalogEntry => {
  const found = allEntries(catalog).find((entry) => entry.variant === variant);
  if (found === undefined) throw new Error(`${variant} is missing from the catalog`);
  return found;
};

describe('buildBadgeCatalog with progress', () => {
  it('has no points and no progress on any entry when the progress is not given', () => {
    const catalog = buildBadgeCatalog(['EVENT_PARTICIPATION_TIER_1']);

    expect(catalog.earnedPoints).toBe(0);
    expect(allEntries(catalog).every((entry) => !('progress' in entry))).toBe(true);
  });

  it('attaches the progress of each badge by slug', () => {
    const progress = createBadgeProgress();
    const catalog = buildBadgeCatalog([], [progress]);

    expect(entryOf(catalog, 'EVENT_PARTICIPATION_TIER_2').progress).toEqual(progress);
    expect(entryOf(catalog, 'EVENT_PARTICIPATION_TIER_3').progress).toBeUndefined();
  });

  it('counts a badge as unlocked when the server says so, even if the profile is not loaded', () => {
    const catalog = buildBadgeCatalog(
      [],
      [createBadgeProgress({ slug: 'COMMUNITY_POST_COUNT_1', unlocked: true, percent: 100, points: 100 })],
    );

    expect(catalog.unlockedCount).toBe(1);
    expect(entryOf(catalog, 'COMMUNITY_POST_COUNT_1').unlocked).toBe(true);
  });

  it('does not count a badge twice when the profile and the server both report it', () => {
    const catalog = buildBadgeCatalog(
      ['COMMUNITY_POST_COUNT_1'],
      [createBadgeProgress({ slug: 'COMMUNITY_POST_COUNT_1', unlocked: true, percent: 100, points: 100 })],
    );

    expect(catalog.unlockedCount).toBe(1);
  });

  it('adds up the points of the unlocked badges only', () => {
    const catalog = buildBadgeCatalog(
      [],
      [
        createBadgeProgress({ slug: 'EVENT_PARTICIPATION_TIER_1', unlocked: true, percent: 100, points: 100 }),
        createBadgeProgress({ slug: 'EVENT_SOCIAL_TIER_1', unlocked: true, percent: 100, points: 150 }),
        createBadgeProgress({ slug: 'EVENT_PARTICIPATION_TIER_2', unlocked: false, points: 250 }),
      ],
    );

    expect(catalog.earnedPoints).toBe(250);
  });

  it('puts the locked badge closest to unlocking first in its category', () => {
    const catalog = buildBadgeCatalog(
      [],
      [
        createBadgeProgress({ slug: 'EVENT_PARTICIPATION_TIER_4', percent: 10 }),
        createBadgeProgress({ slug: 'EVENT_PARTICIPATION_TIER_2', percent: 60 }),
        createBadgeProgress({ slug: 'EVENT_PARTICIPATION_TIER_3', percent: 90 }),
      ],
    );

    const participation = catalog.sections.find((section) => section.category === 'participation');
    const lockedOrder = (participation?.data ?? []).map((entry) => entry.variant);

    expect(lockedOrder.slice(0, 3)).toEqual([
      'EVENT_PARTICIPATION_TIER_3',
      'EVENT_PARTICIPATION_TIER_2',
      'EVENT_PARTICIPATION_TIER_4',
    ]);
  });

  it('keeps unlocked badges ahead of any locked badge, however far along the locked one is', () => {
    const catalog = buildBadgeCatalog(
      ['EVENT_PARTICIPATION_TIER_1'],
      [createBadgeProgress({ slug: 'EVENT_PARTICIPATION_TIER_3', percent: 99 })],
    );

    const participation = catalog.sections.find((section) => section.category === 'participation');

    expect(participation?.data[0]?.variant).toBe('EVENT_PARTICIPATION_TIER_1');
  });

  it('ignores a progress entry for a badge the catalog does not know', () => {
    const catalog = buildBadgeCatalog([], [createBadgeProgress({ slug: 'NOT_A_REAL_BADGE', unlocked: true })]);

    expect(catalog.unlockedCount).toBe(0);
    expect(catalog.earnedPoints).toBe(0);
  });
});
