import { BADGE_REGISTRY } from '@/components/dataDisplay/badge/badge.config';
import type { BadgeVariant } from '@/components/dataDisplay/badge/badge.types';

/**
 * Paliers des badges de participation, en nombre d'evenements termines.
 * Source : docs/badges/README.md (1, 5, 10, 20 evenements).
 */
const PARTICIPATION_TIERS: readonly { variant: BadgeVariant; threshold: number }[] = [
  { variant: 'EVENT_PARTICIPATION_TIER_1', threshold: 1 },
  { variant: 'EVENT_PARTICIPATION_TIER_2', threshold: 5 },
  { variant: 'EVENT_PARTICIPATION_TIER_3', threshold: 10 },
  { variant: 'EVENT_PARTICIPATION_TIER_4', threshold: 20 },
];

export interface ParticipationNextTier {
  variant: BadgeVariant;
  name: string;
  threshold: number;
}

export interface ParticipationProgress {
  nextTier: ParticipationNextTier | null;
  remaining: number;
  ratio: number;
  allTiersReached: boolean;
}

export function getParticipationProgress(finishedEventsCount: number): ParticipationProgress {
  const count = Number.isFinite(finishedEventsCount) ? Math.max(0, finishedEventsCount) : 0;
  const next = PARTICIPATION_TIERS.find((tier) => count < tier.threshold);

  if (next === undefined) {
    return { nextTier: null, remaining: 0, ratio: 1, allTiersReached: true };
  }

  return {
    nextTier: {
      variant: next.variant,
      name: BADGE_REGISTRY[next.variant].name,
      threshold: next.threshold,
    },
    remaining: next.threshold - count,
    ratio: count / next.threshold,
    allTiersReached: false,
  };
}
