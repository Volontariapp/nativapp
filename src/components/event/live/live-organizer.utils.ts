import type { UserWeb } from '@volontariapp/contracts';

export const LIVE_ORGANIZER_EMPTY_MESSAGE = 'Aucun participant ne partage sa position';
export const LIVE_ORGANIZER_APPROXIMATE_NOTE = 'Position approximative (environ 100 m)';
export const LIVE_ORGANIZER_NEUTRAL_LABEL = 'Participant';

/** Nom affichable d'un participant ; jamais l'identifiant brut. */
export function resolveParticipantLabel(
  userId: string,
  participants: readonly Pick<UserWeb, 'id' | 'pseudo'>[],
): string {
  const pseudo = participants.find((participant) => participant.id === userId)?.pseudo.trim();
  return pseudo !== undefined && pseudo.length > 0 ? pseudo : LIVE_ORGANIZER_NEUTRAL_LABEL;
}

export function labelInitial(label: string): string {
  return label.charAt(0).toUpperCase();
}
