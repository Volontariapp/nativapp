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

export const getRankingReasonLabel = (reason: RankingReasonWeb): string => {
  return RANKING_REASON_LABELS[reason];
};
