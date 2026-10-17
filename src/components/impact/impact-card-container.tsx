import React from 'react';
import { ImpactCard } from './impact-card';
import { useImpactCardData } from './use-impact-card-data';

/** Carte "Mon impact" branchee sur les donnees serveur (accueil et profil). */
export const ImpactCardContainer = (): React.JSX.Element | null => {
  const { totalImpactScore, ...rest } = useImpactCardData();

  if (totalImpactScore === null && !rest.isLoading) {
    return null;
  }

  return <ImpactCard {...rest} totalImpactScore={totalImpactScore ?? 0} />;
};
