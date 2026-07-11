import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import type { AppEvent } from '@/api/event/event.api';

interface MapContextValue {
  selectedEvent: AppEvent | null;
  selectEvent: (event: AppEvent | null) => void;
  centerCoordinates: { latitude: number; longitude: number } | null;
  setCenterCoordinates: (coords: { latitude: number; longitude: number }) => void;
}

const MapContext = createContext<MapContextValue | undefined>(undefined);

export function useMapContext(): MapContextValue {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
}

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

  return (
    <MapContext.Provider
      value={{
        selectedEvent,
        selectEvent,
        centerCoordinates,
        setCenterCoordinates,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}
