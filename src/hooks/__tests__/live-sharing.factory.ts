import type { LiveSharingTarget } from '../live-sharing.types';

export const LIVE_EVENT_ID = 'evt-live-1';

/** Evenement a Paris ; les positions de test s'en eloignent ou s'en rapprochent. */
export const LIVE_TARGET_LOCATION = { latitude: 48.8606, longitude: 2.3376 };

export const createLiveSharingTarget = (overrides?: Partial<LiveSharingTarget>): LiveSharingTarget => ({
  eventId: LIVE_EVENT_ID,
  location: LIVE_TARGET_LOCATION,
  ...overrides,
});

/** Position brute a quelques centaines de metres de l'evenement (hors rayon d'arrivee). */
export const FAR_RAW_POSITION = { latitude: 48.85666, longitude: 2.35222 };

/** Position brute a environ 20 m de l'evenement (dans le rayon d'arrivee de 50 m). */
export const NEAR_RAW_POSITION = { latitude: 48.86078, longitude: 2.3376 };
