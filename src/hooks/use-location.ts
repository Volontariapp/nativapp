import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import type { LocationObject } from 'expo-location';

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

interface UseLocationResult {
  /** LocationObject complet (contient coords + timestamp) — requis par certains composants comme EventCard */
  locationObject: LocationObject | null;
  /** Coordonnées simplifiées pour la navigation et les API */
  coordinates: UserCoordinates | null;
  isPermissionDenied: boolean;
}

/**
 * Demande la permission de géolocalisation au premier montage et
 * retourne le LocationObject complet ainsi que des coordonnées simplifiées.
 *
 * Cleanup via `isActiveRef` : évite tout setState sur un composant démonté (Memory Leak Prevention).
 */
export function useLocation(): UseLocationResult {
  const [locationObject, setLocationObject] = useState<LocationObject | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const isActiveRef = useRef(true);

  useEffect(() => {
    isActiveRef.current = true;

    const requestLocation = async (): Promise<void> => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (!isActiveRef.current) return;

      if (status !== Location.PermissionStatus.GRANTED) {
        setIsPermissionDenied(true);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!isActiveRef.current) return;

      setLocationObject(location);
    };

    void requestLocation();

    return () => {
      isActiveRef.current = false;
    };
  }, []);

  const coordinates: UserCoordinates | null =
    locationObject !== null
      ? {
          latitude: locationObject.coords.latitude,
          longitude: locationObject.coords.longitude,
        }
      : null;

  return { locationObject, coordinates, isPermissionDenied };
}
