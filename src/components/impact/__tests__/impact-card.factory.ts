import type { ImpactCardProps } from '../impact-card.types';

export const createImpactCardProps = (
  overrides: Partial<ImpactCardProps> = {},
): ImpactCardProps => ({
  isLoading: false,
  totalImpactScore: 120,
  progress: {
    allTiersReached: false,
    nextTier: { variant: 'EVENT_PARTICIPATION_TIER_2', name: 'Engagé·e', threshold: 5 },
    remaining: 4,
    ratio: 0.2,
  },
  nextEvent: { title: 'Maraude du samedi', startAt: '2999-10-15T10:00:00.000Z' },
  ...overrides,
});
