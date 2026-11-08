import type { LeaderboardEntryWeb, LeaderboardScopeWeb } from '@volontariapp/contracts';
import type { RankDistinction, RankTier } from './rank.types';

/** Un classement global l'emporte sur le mois, qui l'emporte sur la semaine. */
export const RANK_SCOPE_PRIORITY: readonly LeaderboardScopeWeb[] = ['global', 'month', 'week'];

/** Nombre de places du podium qui donnent un cadre. */
export const RANK_PODIUM_SIZE = 3;

export const isRankTier = (value: number): value is RankTier =>
  value === 1 || value === 2 || value === 3;

/** Garde la distinction la plus forte : le classement prioritaire d'abord, puis la meilleure place. */
export const pickBestDistinction = (
  distinctions: readonly RankDistinction[],
): RankDistinction | undefined => {
  let best: RankDistinction | undefined;
  for (const candidate of distinctions) {
    if (best === undefined) {
      best = candidate;
      continue;
    }
    const candidatePriority = RANK_SCOPE_PRIORITY.indexOf(candidate.scope);
    const bestPriority = RANK_SCOPE_PRIORITY.indexOf(best.scope);
    if (
      candidatePriority < bestPriority ||
      (candidatePriority === bestPriority && candidate.tier < best.tier)
    ) {
      best = candidate;
    }
  }
  return best;
};

export type PodiumsByScope = Readonly<Record<LeaderboardScopeWeb, readonly LeaderboardEntryWeb[]>>;

/**
 * Associe chaque utilisateur du podium à sa meilleure distinction. Les ex æquo gardent leur rang :
 * seuls les rangs 1 à 3 donnent un cadre.
 */
export const buildDistinctionMap = (
  podiums: PodiumsByScope,
): ReadonlyMap<string, RankDistinction> => {
  const collected = new Map<string, RankDistinction[]>();

  for (const scope of RANK_SCOPE_PRIORITY) {
    for (const entry of podiums[scope]) {
      if (!isRankTier(entry.rank)) continue;
      const list = collected.get(entry.userId) ?? [];
      list.push({ scope, tier: entry.rank });
      collected.set(entry.userId, list);
    }
  }

  const best = new Map<string, RankDistinction>();
  for (const [userId, list] of collected) {
    const pick = pickBestDistinction(list);
    if (pick !== undefined) best.set(userId, pick);
  }
  return best;
};
