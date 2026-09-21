import { useRef, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Region, MarkerPressEvent } from 'react-native-maps';
import MapView, { UrlTile, Marker } from 'react-native-maps';
import { theme } from '@/shared/themes/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import type { AppEvent } from '@/api/event/event.api';
import { CustomMarker } from './MapPin';
import { EventType } from '@volontariapp/contracts';
import {
  useFloatingTabBarOffset,
  PREVUE_CARD_HEIGHT_ESTIMATE,
} from '@/navigation/hooks/useFloatingTabBarOffset';

export interface AppMapProps {
  userLocation?: { latitude: number; longitude: number };
  events: AppEvent[];
  onMarkerPress?: (event: AppEvent) => void;
  onMapPress?: () => void;
  initialCenter?: { latitude: number; longitude: number };
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  showRecenterButton?: boolean;
  hasBottomPreview?: boolean;
  bottomOffset?: number;
}

export default function AppMap({
  userLocation,
  events,
  onMarkerPress,
  onMapPress,
  initialCenter,
  scrollEnabled = true,
  zoomEnabled = true,
  showRecenterButton = true,
  hasBottomPreview = false,
  bottomOffset,
}: AppMapProps) {
  const { theme: appTheme } = useAppTheme();
  const { cardBottomOffset, sideButtonBottomOffset } = useFloatingTabBarOffset();
  const mapRef = useRef<MapView | null>(null);
  const lastMarkerPressTimestamp = useRef(0);

  const recenterBottom = useMemo(() => {
    if (bottomOffset !== undefined) {
      return hasBottomPreview
        ? bottomOffset + PREVUE_CARD_HEIGHT_ESTIMATE
        : bottomOffset;
    }
    return hasBottomPreview
      ? cardBottomOffset + PREVUE_CARD_HEIGHT_ESTIMATE
      : sideButtonBottomOffset;
  }, [bottomOffset, hasBottomPreview, cardBottomOffset, sideButtonBottomOffset]);

  // Filtrer les événements avec coordonnées valides pour éviter d'injecter des enfants null dans MapView
  const validEvents = useMemo(() => {
    return events.filter(
      (
        event,
      ): event is AppEvent & {
        location: { latitude: number; longitude: number };
      } =>
        event.location != null &&
        typeof event.location.latitude === 'number' &&
        typeof event.location.longitude === 'number' &&
        !Number.isNaN(event.location.latitude) &&
        !Number.isNaN(event.location.longitude),
    );
  }, [events]);

  // Incrémenter une version à chaque changement de la liste d'événements (ex: changement de filtre).
  // Cela force React à démonter l'ancien lot et remonter le nouveau de manière séquentielle,
  // évitant le bug natif d'Apple Maps / AIRMap sur iOS : "insertObject:atIndex: index beyond bounds".
  const filterVersionRef = useRef(0);
  const prevEventsRef = useRef(events);
  if (prevEventsRef.current !== events) {
    prevEventsRef.current = events;
    filterVersionRef.current += 1;
  }
  const currentVersion = filterVersionRef.current;

  const eventMap = useMemo(() => {
    const map = new Map<string, AppEvent>();
    for (const event of validEvents) {
      map.set(event.id, event);
    }
    return map;
  }, [validEvents]);

  const handleRecenter = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
    }
  }, [userLocation]);

  const handleMarkerPress = useCallback(
    (event: AppEvent) => {
      lastMarkerPressTimestamp.current = Date.now();
      onMarkerPress?.(event);
    },
    [onMarkerPress],
  );

  const handleMapPress = useCallback(() => {
    // Sur iOS / MapKit, un tap sur un marker propage également l'événement au MapView.
    // Pour éviter de refermer instantanément la prévisualisation qui vient de s'ouvrir,
    // on ignore les clics sur la carte survenus dans les 400ms suivant un clic sur un marker.
    if (Date.now() - lastMarkerPressTimestamp.current < 400) {
      return;
    }
    onMapPress?.();
  }, [onMapPress]);

  const handleNativeMarkerPress = useCallback(
    (e: MarkerPressEvent) => {
      lastMarkerPressTimestamp.current = Date.now();
      const markerId = e.nativeEvent.id;
      if (markerId && eventMap.has(markerId)) {
        const ev = eventMap.get(markerId);
        if (ev) {
          onMarkerPress?.(ev);
        }
      }
    },
    [eventMap, onMarkerPress],
  );

  const centerLat = initialCenter?.latitude ?? userLocation?.latitude ?? 46.2276;
  const centerLon = initialCenter?.longitude ?? userLocation?.longitude ?? 2.2137;
  const hasSpecificCenter = !!initialCenter || !!userLocation;

  const initialRegion: Region = {
    latitude: centerLat,
    longitude: centerLon,
    latitudeDelta: hasSpecificCenter ? 0.05 : 10,
    longitudeDelta: hasSpecificCenter ? 0.05 : 10,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        provider={undefined}
        showsUserLocation={false}
        scrollEnabled={scrollEnabled}
        zoomEnabled={zoomEnabled}
        onPress={handleMapPress}
        onMarkerPress={handleNativeMarkerPress}
      >
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Ma position"
            pinColor={theme.colors.primarySocio}
          />
        )}

        {validEvents.map((event) => {
          return (
            <CustomMarker
              key={`custom-marker-${event.id}-v${String(currentVersion)}`}
              identifier={event.id}
              coordinate={{
                latitude: event.location.latitude,
                longitude: event.location.longitude,
              }}
              color={
                event.type === EventType.EVENT_TYPE_SOCIAL ||
                (event.type as unknown) === 'EVENT_TYPE_SOCIAL'
                  ? theme.colors.primarySocio
                  : theme.colors.primaryEco
              }
              onPress={() => {
                handleMarkerPress(event);
              }}
            />
          );
        })}
      </MapView>

      {showRecenterButton && userLocation && scrollEnabled && (
        <View style={[styles.recenterContainer, { bottom: recenterBottom }]}>
          <AppIconsButton
            icon="crosshair"
            size={48}
            variant="white"
            iconColor={appTheme.colors.text}
            onPress={handleRecenter}
            accessibilityLabel="Recentrer sur ma position"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  recenterContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 1100,
    borderRadius: theme.radius.full,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
  },
});


