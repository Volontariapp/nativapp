import type { LiveSharingStopReason } from '@volontariapp/messaging';
import type { LiveSharingClientStopReason } from '@/api/live/live.types';
import type { Coordinates } from '@/services/routing.service';

export type LiveSharingStatus = 'idle' | 'starting' | 'sharing' | 'stopping' | 'error';

export interface LiveSharingTarget {
  eventId: string;
  /** Position de l'evenement : sert au calcul local de l'arrivee (D17). */
  location: Coordinates;
}

export interface LiveSharingStop {
  eventId: string;
  reason: LiveSharingStopReason;
}

export interface LiveSharingState {
  status: LiveSharingStatus;
  activeEventId: string | null;
  lastStop: LiveSharingStop | null;
}

export interface UseLiveSharingResult extends LiveSharingState {
  start: (target: LiveSharingTarget) => Promise<void>;
  /** Arret demande par l'appelant (bascule, depart de l'evenement : 'LEFT'). */
  stop: (reason: LiveSharingClientStopReason) => Promise<void>;
}
