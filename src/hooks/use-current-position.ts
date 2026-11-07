import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import type { Coordinates } from '@/services/routing.service';

export type CurrentPositionStatus = 'idle' | 'locating' | 'ready' | 'permission_denied' | 'error';

export interface UseCurrentPositionResult {
  status: CurrentPositionStatus;
  coordinates: Coordinates | null;
  refresh: () => Promise<Coordinates | null>;
}

export function useCurrentPosition(): UseCurrentPositionResult {
  const [status, setStatus] = useState<CurrentPositionStatus>('idle');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  const refresh = useCallback(async (): Promise<Coordinates | null> => {
    if (!isActiveRef.current) {
      return null;
    }

    setStatus('locating');

    try {
      const permissionResponse = await Location.requestForegroundPermissionsAsync();

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!isActiveRef.current) {
        return null;
      }

      if (permissionResponse.status !== Location.PermissionStatus.GRANTED) {
        setStatus('permission_denied');
        setCoordinates(null);
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!isActiveRef.current) {
        return null;
      }

      const coords: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCoordinates(coords);
      setStatus('ready');
      return coords;
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (isActiveRef.current) {
        setStatus('error');
        setCoordinates(null);
      }
      return null;
    }
  }, []);

  return { status, coordinates, refresh };
}
