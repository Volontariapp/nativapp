import { useQuery } from '@tanstack/react-query';
import type { BadgeProgressWeb } from '@volontariapp/contracts';
import { badgeProgressApi } from '../badge-progress.api';
import { BADGE_PROGRESS_QUERY_KEY } from '../user-query-keys';

export { BADGE_PROGRESS_QUERY_KEY };

/** Progression vers chaque badge, rechargee a chaque ouverture de l'ecran des badges. */
export const useBadgeProgress = () => {
  return useQuery<BadgeProgressWeb[]>({
    queryKey: BADGE_PROGRESS_QUERY_KEY,
    queryFn: async () => await badgeProgressApi.getMyBadgeProgress(),
  });
};
