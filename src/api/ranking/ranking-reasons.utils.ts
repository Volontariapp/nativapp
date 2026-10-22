import type { RankingReasonWeb } from '@volontariapp/contracts';

export const RANKING_REASON_LABELS: Record<RankingReasonWeb, string> = {
  NEAR_YOU: 'Proche de vous',
  MATCHES_INTERESTS: 'Selon vos intérêts',
  STARTING_SOON: 'Commence bientôt',
  TRENDING: 'Populaire',
  FRIEND_INVOLVED: 'Des amis participent',
  FOLLOWED_AUTHOR: 'Organisateur suivi',
  FRIEND_AUTHOR: 'Organisé par un ami',
  ENGAGED_AUTHOR: 'Organisateur favori',
  LINKED_EVENT_WISHED: 'Événement lié souhaité',
  LINKED_EVENT_JOINED: 'Événement lié rejoint',
  RECENT: 'Nouveau',
};

export interface RankingReasonExplanation {
  shortDescription: string;
  detailedFormula: string;
  category: 'author' | 'event' | 'recency' | 'social' | 'location' | 'interest';
}

export const RANKING_REASON_EXPLANATIONS: Record<RankingReasonWeb, RankingReasonExplanation> = {
  NEAR_YOU: {
    shortDescription: 'Événement géographiquement proche de votre position.',
    detailedFormula:
      'Score de proximité calculé avec décroissance exponentielle exp(-distance/15km) (coupure à 100 km, poids 27%).',
    category: 'location',
  },
  MATCHES_INTERESTS: {
    shortDescription: 'Correspond à vos thématiques et centres d’intérêt.',
    detailedFormula:
      'Affinité basée sur votre historique d’activités (types d’événements et recouvrement Jaccard des tags, poids 22%).',
    category: 'interest',
  },
  STARTING_SOON: {
    shortDescription: 'L’événement a lieu dans un futur très proche.',
    detailedFormula: 'Boost d’imminence temporel calculé sur les 60 prochains jours (poids 18%).',
    category: 'event',
  },
  TRENDING: {
    shortDescription: 'Événement suscitant un fort engouement collectif.',
    detailedFormula:
      'Popularité calculée via les souhaits (40%), le taux de remplissage (30%) et les mentions récentes (30%) (poids 10%).',
    category: 'interest',
  },
  FRIEND_INVOLVED: {
    shortDescription: 'Au moins un ami participe ou a souhaité cet événement.',
    detailedFormula:
      'Boost social : un contact mutuel participe, a souhaité ou organisé l’événement (poids 23%).',
    category: 'social',
  },
  FOLLOWED_AUTHOR: {
    shortDescription: 'Vous êtes abonné au profil de cet auteur.',
    detailedFormula:
      'Bonus d’affinité d’auteur (+0.25) appliqué à la composante affinité auteur (poids 30%).',
    category: 'author',
  },
  FRIEND_AUTHOR: {
    shortDescription: 'L’auteur fait partie de vos amis (abonnements mutuels).',
    detailedFormula: 'Bonus d’amitié (+0.15) appliqué à la composante affinité auteur (poids 30%).',
    category: 'social',
  },
  ENGAGED_AUTHOR: {
    shortDescription: 'Auteur avec lequel vous interagissez souvent.',
    detailedFormula:
      'Historique d’engagement : vos likes et commentaires passés pour cet auteur (décroissance sur 14 jours, poids 30%).',
    category: 'author',
  },
  LINKED_EVENT_WISHED: {
    shortDescription: 'Post lié à un événement que vous avez mis en favoris.',
    detailedFormula:
      'Composante événement lié activée à 1.0 car l’événement futur est dans votre liste de souhaits (poids 35%).',
    category: 'event',
  },
  LINKED_EVENT_JOINED: {
    shortDescription: 'Post lié à un événement auquel vous participez.',
    detailedFormula:
      'Composante événement lié activée à 1.0 (ou 0.5 si événement passé) car vous y êtes inscrit (poids 35%).',
    category: 'event',
  },
  RECENT: {
    shortDescription: 'Publication très récente sur la plateforme.',
    detailedFormula:
      'Composante de fraîcheur avec décroissance exponentielle exp(-âgeEnHeures/48) (demi-vie ~33h, poids 35%).',
    category: 'recency',
  },
};

export interface ScoringWeightDetail {
  name: string;
  weight: string;
  desc: string;
}

export interface ScoringPenaltyDetail {
  name: string;
  penalty: string;
  desc: string;
}

export interface ScoringFormulaMeta {
  title: string;
  weights: ScoringWeightDetail[];
  penalties: ScoringPenaltyDetail[];
}

export const RANKING_FORMULA_DETAILS: {
  feed: ScoringFormulaMeta;
  events: ScoringFormulaMeta;
} = {
  feed: {
    title: 'Scoring du Feed de Posts',
    weights: [
      {
        name: 'Événement lié',
        weight: '35%',
        desc: '1.0 si futur souhaité ou rejoint, 0.5 si participé passé',
      },
      {
        name: 'Fraîcheur',
        weight: '35%',
        desc: 'Décroissance temporelle exp(-h/48) avec demi-vie d’environ 33 heures',
      },
      {
        name: 'Affinité auteur',
        weight: '30%',
        desc: 'Abonné (+0.25), Ami (+0.15) et historique de likes/commentaires',
      },
    ],
    penalties: [
      {
        name: 'Déjà liké / commenté',
        penalty: '× 0.6',
        desc: 'Rétrogradation de 40% pour privilégier la découverte de nouveaux contenus',
      },
    ],
  },
  events: {
    title: 'Scoring des Événements',
    weights: [
      {
        name: 'Proximité géographique',
        weight: '27%',
        desc: 'Décroissance exp(-distance/15km), exclu au-delà de 100 km',
      },
      {
        name: 'Réseau d’amis',
        weight: '23%',
        desc: '1.0 si un ami participe, a souhaité ou a créé l’événement',
      },
      {
        name: 'Affinité thématique',
        weight: '22%',
        desc: 'Recouvrement entre types et tags de l’événement et votre historique',
      },
      {
        name: 'Imminence',
        weight: '18%',
        desc: 'Décroissance linéaire sur 60 jours avant le début de l’événement',
      },
      {
        name: 'Popularité collective',
        weight: '10%',
        desc: 'Signal global basé sur les souhaits, remplissage et mentions',
      },
    ],
    penalties: [],
  },
};

export const getRankingReasonLabel = (reason: RankingReasonWeb): string => {
  return RANKING_REASON_LABELS[reason];
};

export const getRankingReasonExplanation = (
  reason: RankingReasonWeb,
): RankingReasonExplanation | undefined => {
  return RANKING_REASON_EXPLANATIONS[reason];
};

/**
 * Formate un score pour l'affichage de badge.
 * Préserve un minimum de 1 décimale (ex: '78.4') et autorise jusqu'à 4 décimales
 * significatives pour les scores flottants précis (ex: '0.6425').
 */
export const formatRankingScore = (score: number, maxDecimals: number = 4): string => {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return '0.0';
  }
  const rounded = Number(score.toFixed(maxDecimals));
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: maxDecimals,
    useGrouping: false,
  });
};

/**
 * Retourne le score exact brut non tronqué sous forme de chaîne de caractères.
 */
export const formatExactScore = (score: number): string => {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return '0';
  }
  return score.toString();
};
