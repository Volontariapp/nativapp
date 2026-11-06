import type { BadgeProgressWeb } from '@volontariapp/contracts';

export const createBadgeProgress = (overrides: Partial<BadgeProgressWeb> = {}): BadgeProgressWeb => ({
  slug: 'EVENT_PARTICIPATION_TIER_2',
  name: 'Engagé·e',
  description: 'Participer à 5 événements',
  points: 250,
  unlocked: false,
  percent: 60,
  requirements: [{ metric: 'EVENTS_FINISHED_TOTAL', current: 3, target: 5 }],
  ...overrides,
});
