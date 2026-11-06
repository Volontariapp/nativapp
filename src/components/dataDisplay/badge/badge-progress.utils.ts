import type { BadgeRequirementProgress } from '@volontariapp/contracts';

/** Libelle de ce que mesure chaque compteur de progression d'un badge. */
const METRIC_LABELS: Readonly<Record<string, string>> = {
  EVENTS_FINISHED_TOTAL: 'événements terminés',
  EVENTS_FINISHED_SOCIAL: 'événements socio terminés',
  EVENTS_FINISHED_ECOLOGY: 'événements éco terminés',
  EVENTS_CREATED: 'événements créés',
  POSTS_CREATED: 'posts publiés',
  SOCIAL_LIKES_GIVEN: 'posts aimés',
  SOCIAL_WISHES: 'événements en favoris',
};

/** « 3 / 5 événements terminés ». Une métrique inconnue garde son nom technique. */
export const describeRequirement = ({
  metric,
  current,
  target,
}: Pick<BadgeRequirementProgress, 'metric' | 'current' | 'target'>): string =>
  `${String(current)} / ${String(target)} ${METRIC_LABELS[metric] ?? metric}`;

export const formatPoints = (points: number): string => `+${String(points)} pts`;
