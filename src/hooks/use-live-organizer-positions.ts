import { useEffect, useMemo, useState } from 'react';
import {
  LiveWebsocketMessagingType,
  type ILivePositionsUpdatedWebsocketPayload,
  type ILiveSharingStoppedWebsocketPayload,
} from '@volontariapp/messaging';
import { useSocket } from '@/context/SocketContext';
import type {
  LiveOrganizerPosition,
  UseLiveOrganizerPositionsResult,
} from './live-organizer.types';
import {
  EMPTY_LIVE_ORGANIZER_TABLE,
  LIVE_ORGANIZER_TICK_MS,
  mergePositions,
  pruneStale,
  removePosition,
  toOrganizerPosition,
  type LiveOrganizerTable,
} from './live-organizer.utils';

interface OrganizerState {
  eventId: string | undefined;
  table: LiveOrganizerTable;
}

const EMPTY_STATE: OrganizerState = { eventId: undefined, table: EMPTY_LIVE_ORGANIZER_TABLE };

/** Table de l'evenement courant ; une table d'un autre evenement n'est jamais exposee. */
const tableFor = (state: OrganizerState, eventId: string): LiveOrganizerTable =>
  state.eventId === eventId ? state.table : EMPTY_LIVE_ORGANIZER_TABLE;

/**
 * Positions partagees par les participants, pour l'organisateur (palier 4).
 * Vie privee : memoire seule (jamais stockee ni journalisee, coordonnees comprises), une position
 * par participant, purge apres LIVE_POSITION_STALE_MS, retrait immediat a l'arret du partage.
 * Les handlers sont propres a ce hook ; le socket peut changer (reconnexion) : on se reabonne.
 */
export function useLiveOrganizerPositions(
  eventId: string | undefined,
  enabled: boolean,
): UseLiveOrganizerPositionsResult {
  const { socket } = useSocket();
  const [state, setState] = useState<OrganizerState>(EMPTY_STATE);
  const [now, setNow] = useState<number>(() => Date.now());
  const isActive = enabled && eventId !== undefined;

  useEffect(() => {
    if (!isActive) {
      // Plus de consommateur : on ne garde aucune position en memoire.
      setState(EMPTY_STATE);
      return undefined;
    }
    const timer = setInterval(() => {
      const tickAt = Date.now();
      setNow(tickAt);
      setState((previous) => {
        const table = pruneStale(previous.table, tickAt);
        return table === previous.table ? previous : { ...previous, table };
      });
    }, LIVE_ORGANIZER_TICK_MS);
    return (): void => {
      clearInterval(timer);
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive || socket === null) {
      return undefined;
    }
    const handlePositions = (payload: ILivePositionsUpdatedWebsocketPayload): void => {
      if (payload.eventId !== eventId || !Array.isArray(payload.positions)) {
        return;
      }
      const receivedAt = Date.now();
      const incoming = payload.positions
        .map((position) => toOrganizerPosition(position, receivedAt))
        .filter((position): position is LiveOrganizerPosition => position !== null);
      setNow(receivedAt);
      setState((previous) => ({
        eventId,
        table: mergePositions(
          eventId === previous.eventId ? previous.table : EMPTY_LIVE_ORGANIZER_TABLE,
          incoming,
        ),
      }));
    };
    const handleStopped = (payload: ILiveSharingStoppedWebsocketPayload): void => {
      if (payload.eventId !== eventId) {
        return;
      }
      setState((previous) => {
        if (previous.eventId !== eventId) {
          return previous;
        }
        const table = removePosition(previous.table, payload.userId);
        return table === previous.table ? previous : { ...previous, table };
      });
    };
    socket.on(LiveWebsocketMessagingType.LIVE_POSITIONS_UPDATED, handlePositions);
    socket.on(LiveWebsocketMessagingType.LIVE_SHARING_STOPPED, handleStopped);
    return (): void => {
      socket.off(LiveWebsocketMessagingType.LIVE_POSITIONS_UPDATED, handlePositions);
      socket.off(LiveWebsocketMessagingType.LIVE_SHARING_STOPPED, handleStopped);
    };
  }, [socket, eventId, isActive]);

  const positions = useMemo(
    () =>
      eventId === undefined || !enabled
        ? []
        : [...tableFor(state, eventId).values()].sort((a, b) => b.updatedAt - a.updatedAt),
    [state, eventId, enabled],
  );

  return { positions, now };
}
