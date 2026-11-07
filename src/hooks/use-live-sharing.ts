import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import {
  LiveClientMessageType,
  LiveWebsocketMessagingType,
  type ILivePositionClientPayload,
  type ILiveSharingStoppedWebsocketPayload,
  type LiveSharingStopReason,
} from '@volontariapp/messaging';
import { liveApi } from '@/api/live/live.api';
import type { LiveSharingClientStopReason } from '@/api/live/live.types';
import { haversineMeters, LIVE_ARRIVAL_RADIUS_M } from '@/api/event/live-events.utils';
import { useSocket } from '@/context/SocketContext';
import { socketService } from '@/services/socket.service';
import type { LiveSharingState, LiveSharingTarget, UseLiveSharingResult } from './live-sharing.types';
import { LIVE_SHARING_INTERVAL_MS, roundCoordinate } from './live-sharing.utils';

interface Session {
  target: LiveSharingTarget;
  subscription: Location.LocationSubscription | null;
  /** true des que le PUT a reussi : seul un partage autorise doit etre revoque par un DELETE. */
  granted: boolean;
  /** Raison d'un arret survenu pendant le demarrage, avant la fin du PUT. */
  cancelReason: LiveSharingClientStopReason | null;
  lastEmitAt: number | null;
}

const IDLE_STATE: LiveSharingState = { status: 'idle', activeEventId: null, lastStop: null };

/**
 * Partage de position avec l'organisateur (D7, D17). Une seule session a la fois.
 * Vie privee : la position brute ne sert qu'au calcul local de la distance, seule la position
 * arrondie est emise, et rien (coordonnee comprise) n'est journalise.
 */
export function useLiveSharing(): UseLiveSharingResult {
  const { socket } = useSocket();
  const [state, setState] = useState<LiveSharingState>(IDLE_STATE);
  const sessionRef = useRef<Session | null>(null);
  const isMountedRef = useRef(true);

  const updateState = useCallback((next: LiveSharingState): void => {
    if (isMountedRef.current) {
      setState(next);
    }
  }, []);

  /** Termine la session courante ; `notifyServer` vaut false quand le serveur l'a deja arretee. */
  const endSession = useCallback(
    async (reason: LiveSharingStopReason, notifyServer: boolean): Promise<void> => {
      const session = sessionRef.current;
      if (session === null) {
        return;
      }
      sessionRef.current = null;
      session.subscription?.remove();
      session.subscription = null;
      const { eventId } = session.target;

      if (notifyServer && !session.granted) {
        // PUT encore en vol : start() enverra le DELETE des qu'il aura abouti.
        session.cancelReason = reason === 'ARRIVED' || reason === 'LEFT' ? reason : 'STOPPED';
        updateState({ status: 'idle', activeEventId: null, lastStop: { eventId, reason } });
        return;
      }
      if (notifyServer) {
        updateState({ status: 'stopping', activeEventId: eventId, lastStop: null });
        try {
          await liveApi.stopSharing(
            eventId,
            reason === 'ARRIVED' || reason === 'LEFT' ? reason : 'STOPPED',
          );
        } catch {
          // Le TTL de l'autorisation cote serveur borne le partage meme si le DELETE echoue.
        }
      }
      updateState({ status: 'idle', activeEventId: null, lastStop: { eventId, reason } });
    },
    [updateState],
  );

  const endSessionRef = useRef(endSession);
  endSessionRef.current = endSession;

  const handleLocation = useCallback((session: Session, location: Location.LocationObject) => {
    if (sessionRef.current !== session) {
      return;
    }
    const raw = { latitude: location.coords.latitude, longitude: location.coords.longitude };
    // La position brute ne quitte jamais cette fonction : calcul local, puis arrondi.
    if (haversineMeters(raw, session.target.location) <= LIVE_ARRIVAL_RADIUS_M) {
      void endSessionRef.current('ARRIVED', true);
      return;
    }
    const now = Date.now();
    if (session.lastEmitAt !== null && now - session.lastEmitAt < LIVE_SHARING_INTERVAL_MS) {
      return;
    }
    const payload: ILivePositionClientPayload = {
      eventId: session.target.eventId,
      latitude: roundCoordinate(raw.latitude),
      longitude: roundCoordinate(raw.longitude),
    };
    const currentSocket = socketService.getSocket();
    if (currentSocket === null) {
      return;
    }
    session.lastEmitAt = now;
    currentSocket.emit(LiveClientMessageType.LIVE_POSITION, payload);
  }, []);

  const stop = useCallback(
    async (reason: LiveSharingClientStopReason): Promise<void> => {
      await endSession(reason, true);
    },
    [endSession],
  );

  const start = useCallback(
    async (target: LiveSharingTarget): Promise<void> => {
      if (sessionRef.current !== null) {
        await endSession('STOPPED', true);
      }
      const session: Session = {
        target,
        subscription: null,
        granted: false,
        cancelReason: null,
        lastEmitAt: null,
      };
      sessionRef.current = session;
      updateState({ status: 'starting', activeEventId: target.eventId, lastStop: null });

      const fail = (): void => {
        if (sessionRef.current === session) {
          sessionRef.current = null;
        }
        updateState({ status: 'error', activeEventId: target.eventId, lastStop: null });
      };

      try {
        // Permission d'abord : aucune autorisation serveur n'est creee si la position est refusee.
        const permission = await Location.requestForegroundPermissionsAsync();
        if (sessionRef.current !== session) {
          return;
        }
        if (permission.status !== Location.PermissionStatus.GRANTED) {
          fail();
          return;
        }

        await liveApi.startSharing(target.eventId);
        session.granted = true;
        if (sessionRef.current !== session) {
          await liveApi.stopSharing(target.eventId, session.cancelReason ?? 'STOPPED').catch(() => {
            // Borne par le TTL de l'autorisation cote serveur.
          });
          return;
        }

        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: LIVE_SHARING_INTERVAL_MS,
            distanceInterval: 0,
          },
          (location) => {
            handleLocation(session, location);
          },
          () => {
            // Permission retiree ou capteur indisponible.
            void endSessionRef.current('STOPPED', true);
          },
        );
        if (sessionRef.current !== session) {
          subscription.remove();
          return;
        }
        session.subscription = subscription;
        updateState({ status: 'sharing', activeEventId: target.eventId, lastStop: null });
      } catch {
        if (sessionRef.current !== session) {
          return;
        }
        if (session.granted) {
          await endSession('STOPPED', true);
        }
        fail();
      }
    },
    [endSession, handleLocation, updateState],
  );

  // Arret serveur (fin d'evenement, revocation, repli d'arrivee) : pas de DELETE en retour.
  // Le socket peut changer (rafraichissement du jeton apres connect_error) : on se reabonne.
  useEffect(() => {
    if (socket === null) {
      return undefined;
    }
    const handleSharingStopped = (payload: ILiveSharingStoppedWebsocketPayload): void => {
      if (sessionRef.current?.target.eventId !== payload.eventId) {
        return;
      }
      void endSessionRef.current(payload.reason, false);
    };
    socket.on(LiveWebsocketMessagingType.LIVE_SHARING_STOPPED, handleSharingStopped);
    return (): void => {
      socket.off(LiveWebsocketMessagingType.LIVE_SHARING_STOPPED, handleSharingStopped);
    };
  }, [socket]);

  // Foreground uniquement : tout etat autre qu'actif (arriere-plan, ou inactif sous iOS) arrete.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        void endSessionRef.current('STOPPED', true);
      }
    });
    return (): void => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return (): void => {
      isMountedRef.current = false;
      void endSessionRef.current('STOPPED', true);
    };
  }, []);

  return { ...state, start, stop };
}
