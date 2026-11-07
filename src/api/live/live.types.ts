import type { ILiveRevokeRequest } from '@volontariapp/messaging';

/** Raisons qu'un client peut donner au DELETE du partage (les autres viennent du serveur). */
export type LiveSharingClientStopReason = ILiveRevokeRequest['reason'];
