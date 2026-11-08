import { useMemo } from 'react';
import { buildDistinctionMap } from '@/shared/lib/rank/rank-distinction';
import type { RankDistinction } from '@/shared/lib/rank/rank.types';
import { usePodiums } from './use-podiums';

/** Meilleure distinction de chaque utilisateur du podium, recalculée quand un podium change. */
export const useDistinctionMap = (): ReadonlyMap<string, RankDistinction> => {
  const podiums = usePodiums();
  return useMemo(() => buildDistinctionMap(podiums), [podiums]);
};

/** Distinction d'un utilisateur, ou `undefined` s'il n'est sur aucun podium. */
export const useUserDistinction = (userId?: string): RankDistinction | undefined => {
  const distinctions = useDistinctionMap();
  return userId === undefined ? undefined : distinctions.get(userId);
};
