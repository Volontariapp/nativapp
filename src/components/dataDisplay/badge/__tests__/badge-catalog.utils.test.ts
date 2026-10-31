import { BADGE_VARIANTS } from '../badge.config';
import { buildBadgeCatalog } from '../badge-catalog.utils';

describe('buildBadgeCatalog', () => {
  it('counts every existing badge as part of the total', () => {
    const catalog = buildBadgeCatalog([]);

    expect(catalog.total).toBe(BADGE_VARIANTS.length);
    expect(catalog.unlockedCount).toBe(0);
  });

  it('counts the badges the user owns, however they are written', () => {
    const catalog = buildBadgeCatalog([
      'EVENT_PARTICIPATION_TIER_1',
      {
        id: 'badge-1',
        slug: 'COMMUNITY_POST_COUNT_1',
        name: 'Première Plume',
        description: 'Poster 1 post',
      },
    ]);

    expect(catalog.unlockedCount).toBe(2);
  });

  it('ignores unknown badges and counts a badge only once', () => {
    const catalog = buildBadgeCatalog([
      'EVENT_PARTICIPATION_TIER_1',
      'event-participation-tier-1',
      'NOT_A_REAL_BADGE',
    ]);

    expect(catalog.unlockedCount).toBe(1);
  });

  it('groups the badges by category with their label', () => {
    const catalog = buildBadgeCatalog([]);

    expect(catalog.sections.map((section) => section.category)).toEqual([
      'participation',
      'interaction',
    ]);
    expect(catalog.sections.map((section) => section.title)).toEqual([
      'Badge de participation',
      "Badge d'interaction",
    ]);
  });

  it('lists the unlocked badges first, then the locked ones in catalog order', () => {
    const catalog = buildBadgeCatalog(['EVENT_PARTICIPATION_TIER_3', 'EVENT_PARTICIPATION_TIER_1']);
    const participation = catalog.sections[0]?.data ?? [];

    expect(participation.slice(0, 2).map((entry) => entry.variant)).toEqual([
      'EVENT_PARTICIPATION_TIER_1',
      'EVENT_PARTICIPATION_TIER_3',
    ]);
    expect(participation.slice(0, 2).every((entry) => entry.unlocked)).toBe(true);
    expect(participation.slice(2).every((entry) => !entry.unlocked)).toBe(true);
    expect(participation[2]?.variant).toBe('EVENT_PARTICIPATION_TIER_2');
  });
});
