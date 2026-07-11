import type { ReactNode } from 'react';
import { createContext, useState, useCallback, useMemo } from 'react';
import type { AppEvent } from '@/api/event/event.api';

interface MapContextValue {
  selectedEvent: AppEvent | null;
  selectEvent: (event: AppEvent | null) => void;
  centerCoordinates: { latitude: number; longitude: number } | null;
  setCenterCoordinates: (coords: { latitude: number; longitude: number }) => void;
}

const MapContext = createContext<MapContextValue | undefined>(undefined);

interface MapProviderProps {
  children: ReactNode;
}

export function MapProvider({ children }: MapProviderProps) {
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [centerCoordinates, setCenterCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const selectEvent = useCallback((event: AppEvent | null) => {
    setSelectedEvent(event);
  }, []);

  const value = useMemo(
    () => ({
      selectedEvent,
      selectEvent,
      centerCoordinates,
      setCenterCoordinates,
    }),
    [selectedEvent, selectEvent, centerCoordinates, setCenterCoordinates],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}
