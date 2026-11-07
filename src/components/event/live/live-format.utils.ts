import type { AppEvent } from '@/api/event/event.api';

export function formatWalkDuration(walkSeconds: number): string {
  return `${String(Math.max(1, Math.ceil(walkSeconds / 60)))} min`;
}

/** Ex. "Fin dans 1 h 20", "Fin dans 35 min", "Fin dans 2 h". */
export function formatRemainingTime(endAt: string, now: number): string {
  const remainingMs = new Date(endAt).getTime() - now;
  if (Number.isNaN(remainingMs) || remainingMs <= 0) {
    return 'Terminé';
  }
  const totalMinutes = Math.max(1, Math.round(remainingMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `Fin dans ${String(minutes)} min`;
  }
  return minutes === 0
    ? `Fin dans ${String(hours)} h`
    : `Fin dans ${String(hours)} h ${String(minutes).padStart(2, '0')}`;
}

/** "12/20" ; une capacite <= 0 signifie sans limite (D19). */
export function formatParticipantsCount(
  event: Pick<AppEvent, 'maxParticipants' | 'currentParticipants'>,
): string {
  return event.maxParticipants > 0
    ? `${String(event.currentParticipants)}/${String(event.maxParticipants)}`
    : String(event.currentParticipants);
}

export function formatParticipantsLabel(count: number): string {
  return `${String(count)} participant${count > 1 ? 's' : ''}`;
}
