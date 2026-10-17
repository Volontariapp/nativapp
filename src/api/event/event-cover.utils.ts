import type { CoverStatusWeb, Event, EventDTO } from '@volontariapp/contracts';
import { getFakeEcologyImage } from '@/utils/fake-images.util';

const COVER_STATUSES: readonly CoverStatusWeb[] = ['NONE', 'PENDING', 'READY', 'REJECTED'];

export interface EventCoverFields {
  coverStatus: CoverStatusWeb | undefined;
  coverUrl: string | undefined;
}

/**
 * Photo d'un évènement telle que la gateway l'expose : `coverUrl` n'est présente que lorsque
 * `coverStatus` vaut READY. Un statut numérique (type gRPC brut) ou inconnu est ignoré.
 */
export const readEventCover = (event: EventDTO | Event): EventCoverFields => ({
  coverStatus: COVER_STATUSES.find((status) => status === event.coverStatus),
  coverUrl: 'coverUrl' in event && event.coverUrl !== '' ? event.coverUrl : undefined,
});

/**
 * Image à afficher pour un évènement : sa photo quand elle est prête, sinon une image de
 * remplacement stable par évènement (même rôle que le placeholder tant que coverStatus != READY).
 */
export const getEventImageUri = (event: { id: string; coverUrl?: string }): string =>
  event.coverUrl !== undefined && event.coverUrl !== ''
    ? event.coverUrl
    : getFakeEcologyImage(event.id);
