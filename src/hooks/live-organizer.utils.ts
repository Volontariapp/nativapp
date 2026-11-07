import type { ILiveParticipantPosition } from '@volontariapp/messaging';
import { LIVE_POSITION_STALE_MS } from '@/api/event/live-events.utils';
import type { LiveOrganizerPosition } from './live-organizer.types';

/** Periode de la minuterie qui purge les positions perimees et rafraichit l'age affiche. */
export const LIVE_ORGANIZER_TICK_MS = 10 * 1000;

export type LiveOrganizerTable = ReadonlyMap<string, LiveOrganizerPosition>;

export const EMPTY_LIVE_ORGANIZER_TABLE: LiveOrganizerTable = new Map();

/** Convertit une position recue ; renvoie null si elle est inexploitable (donnee du reseau non fiable). */
export function toOrganizerPosition(
  position: ILiveParticipantPosition,
  receivedAt: number,
): LiveOrganizerPosition | null {
  if (
    typeof position.userId !== 'string' ||
    position.userId.length === 0 ||
    !Number.isFinite(position.latitude) ||
    !Number.isFinite(position.longitude)
  ) {
    return null;
  }
  const parsed = new Date(position.updatedAt).getTime();
  return {
    userId: position.userId,
    latitude: position.latitude,
    longitude: position.longitude,
    updatedAt: Number.isNaN(parsed) ? receivedAt : parsed,
  };
}

/** Ajoute ou remplace les positions ; une position plus ancienne que celle connue est ignoree. */
export function mergePositions(
  table: LiveOrganizerTable,
  incoming: readonly LiveOrganizerPosition[],
): LiveOrganizerTable {
  const next = new Map(table);
  for (const position of incoming) {
    const known = next.get(position.userId);
    if (known === undefined || known.updatedAt <= position.updatedAt) {
      next.set(position.userId, position);
    }
  }
  return next;
}

export function removePosition(table: LiveOrganizerTable, userId: string): LiveOrganizerTable {
  if (!table.has(userId)) {
    return table;
  }
  const next = new Map(table);
  next.delete(userId);
  return next;
}

/** Retire les positions plus vieilles que LIVE_POSITION_STALE_MS ; renvoie la meme table si rien ne change. */
export function pruneStale(table: LiveOrganizerTable, now: number): LiveOrganizerTable {
  let next: Map<string, LiveOrganizerPosition> | null = null;
  for (const [userId, position] of table) {
    if (now - position.updatedAt > LIVE_POSITION_STALE_MS) {
      next ??= new Map(table);
      next.delete(userId);
    }
  }
  return next ?? table;
}

/** "il y a 20 s", "il y a 1 min". */
export function formatPositionAge(updatedAt: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - updatedAt) / 1000));
  if (seconds < 60) {
    return `il y a ${String(seconds)} s`;
  }
  return `il y a ${String(Math.floor(seconds / 60))} min`;
}
