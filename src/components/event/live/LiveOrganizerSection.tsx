import React, { useEffect, useState } from 'react';
import type { UserWeb } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import { isEventJoinableLive } from '@/api/event/live-events.utils';
import { useLiveOrganizerPositions } from '@/hooks/use-live-organizer-positions';
import { LiveOrganizerMap } from './LiveOrganizerMap';

/** Re-evalue "en direct" (fin de l'evenement) sans attendre une autre mise a jour de l'ecran. */
const LIVE_CLOCK_MS = 30 * 1000;

export interface LiveOrganizerSectionProps {
  event: AppEvent | undefined;
  /** Identifiant de l'utilisateur connecte, compare a l'organisateur de l'evenement. */
  currentUserId: string | null | undefined;
  participants: readonly Pick<UserWeb, 'id' | 'pseudo'>[];
}

/** Carte de l'organisateur : visible (et ecoute active) pour l'organisateur d'un evenement en direct seulement. */
export function LiveOrganizerSection({
  event,
  currentUserId,
  participants,
}: LiveOrganizerSectionProps): React.JSX.Element | null {
  const [clock, setClock] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setClock(Date.now());
    }, LIVE_CLOCK_MS);
    return (): void => {
      clearInterval(timer);
    };
  }, []);

  const isOrganizer =
    event !== undefined &&
    typeof currentUserId === 'string' &&
    currentUserId.length > 0 &&
    event.organizerId === currentUserId;
  const liveEvent = event !== undefined && isEventJoinableLive(event, clock) ? event : null;
  const enabled = isOrganizer && liveEvent !== null;
  const { positions, now } = useLiveOrganizerPositions(event?.id, enabled);

  if (liveEvent === null || !enabled) {
    return null;
  }
  return (
    <LiveOrganizerMap
      eventTitle={liveEvent.title}
      eventLocation={liveEvent.location}
      positions={positions}
      now={now}
      participants={participants}
    />
  );
}
