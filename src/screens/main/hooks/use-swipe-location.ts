import { useCallback, useEffect, useRef } from 'react';
import type { LocationObject } from 'expo-location';
import { useLocation } from '@/hooks/use-location';
import { rankingApi } from '@/api/ranking/ranking.api';

const LOCATION_SEND_INTERVAL_MS = 60_000;

export interface SwipeLocation {
  userLocation: LocationObject | null;
  /** Envoie la position au classement : au plus 1 appel par minute, si la permission est accordee. */
  sendLocationIfAllowed: () => Promise<void>;
}

/** Geolocalisation pour le classement ; l'envoi initial part des que les coordonnees sont connues. */
export const useSwipeLocation = (): SwipeLocation => {
  const { locationObject: userLocation, coordinates, isPermissionDenied } = useLocation();

  const lastLocationSentAtRef = useRef<number>(0);
  const coordinatesRef = useRef(coordinates);
  const isPermissionDeniedRef = useRef(isPermissionDenied);

  useEffect(() => {
    coordinatesRef.current = coordinates;
    isPermissionDeniedRef.current = isPermissionDenied;
  }, [coordinates, isPermissionDenied]);

  const sendLocationIfAllowed = useCallback(async (): Promise<void> => {
    if (isPermissionDeniedRef.current) {
      return;
    }
    const coords = coordinatesRef.current;
    if (coords == null) {
      return;
    }
    const now = Date.now();
    if (now - lastLocationSentAtRef.current < LOCATION_SEND_INTERVAL_MS) {
      return;
    }
    lastLocationSentAtRef.current = now;
    try {
      await rankingApi.updateLocation(coords.latitude, coords.longitude);
    } catch (err) {
      console.warn('[useSwipeScreen] Failed to update location for ranking:', err);
    }
  }, []);

  // Envoi initial dès disponibilité des coordonnées
  useEffect(() => {
    if (coordinates && !isPermissionDenied) {
      void sendLocationIfAllowed();
    }
  }, [coordinates, isPermissionDenied, sendLocationIfAllowed]);

  return { userLocation, sendLocationIfAllowed };
};
