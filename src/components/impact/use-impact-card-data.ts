import { useMemo } from 'react';
import { useProfile } from '@/api/user/hooks/use-profile';
import { getParticipationProgress } from '@/shared/lib/impact-progress.utils';
import type { ImpactCardProps } from './impact-card.types';
import { summarizeImpactEvents } from './impact-events-summary.utils';
import { useCappedParticipatedEvents } from './use-capped-participated-events';

export interface ImpactCardData extends Omit<ImpactCardProps, 'totalImpactScore'> {
  /** Null tant que le profil n'est pas disponible (erreur ou chargement). */
  totalImpactScore: number | null;
}

/**
 * Hook de conteneur de la carte "Mon impact". Il n'utilise que le profil et la
 * liste des participations (2 requetes), pas useProfileEvents (3 requetes).
 */
export const useImpactCardData = (): ImpactCardData => {
  const profile = useProfile();
  const participated = useCappedParticipatedEvents();

  const summary = useMemo(
    () => summarizeImpactEvents(participated.events, new Date()),
    [participated.events],
  );

  return {
    isLoading: profile.isLoading || participated.isLoading,
    totalImpactScore: profile.data?.totalImpactScore ?? null,
    progress: getParticipationProgress(summary.finishedCount),
    nextEvent: summary.nextEvent,
  };
};
