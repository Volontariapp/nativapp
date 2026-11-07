import type { LiveSharingStopReason } from '@volontariapp/messaging';

/** Intervalle entre deux emissions (Q7). */
export const LIVE_SHARING_INTERVAL_MS = 30 * 1000;

const COORDINATE_DECIMALS = 1000;

/** 3 decimales : environ 111 m en latitude (D7). A appliquer avant tout envoi. */
export function roundCoordinate(value: number): number {
  return Math.round(value * COORDINATE_DECIMALS) / COORDINATE_DECIMALS;
}

export const LIVE_SHARING_STOP_MESSAGES: Record<LiveSharingStopReason, string> = {
  ARRIVED: 'Vous êtes arrivé : le partage de votre position est arrêté.',
  STOPPED: 'Le partage de votre position est arrêté. Vous pouvez le réactiver à tout moment.',
  EVENT_ENDED: "L'événement est terminé : le partage de votre position est arrêté.",
  LEFT: "Vous avez quitté l'événement : le partage de votre position est arrêté.",
  REVOKED: 'Le partage de votre position a été arrêté.',
  EXPIRED: 'Le partage de votre position a expiré.',
};
