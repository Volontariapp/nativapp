import { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { theme } from '@/shared/themes/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import { EventType } from '@volontariapp/contracts';
import type { AppMapProps } from './AppMap';
const createCustomMarkerIcon = (
  color: string = theme.colors.primaryEco,
  size: number = 40,
) => {
  const sizeStr = size.toString();
  const iconSizeStr = Math.round(size * 0.5).toString();
  return L.divIcon({
    className: 'custom-leaflet-marker-pin',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: ${sizeStr}px; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35)); cursor: pointer;">
        <div style="
          width: ${sizeStr}px;
          height: ${sizeStr}px;
          background-color: ${color};
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        ">
          <svg width="${iconSizeStr}" height="${iconSizeStr}" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="3" y2="10"></line>
          </svg>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
          margin-top: -2px;
        "></div>
      </div>
    `,
    iconSize: [size, size + 6],
    iconAnchor: [size / 2, size + 6],
    popupAnchor: [0, -(size + 6)],
  });
};

const ecoMarkerIcon = createCustomMarkerIcon(theme.colors.primaryEco, 40);
const socioMarkerIcon = createCustomMarkerIcon(theme.colors.primarySocio, 40);

const userMarkerIcon = L.divIcon({
  className: 'custom-leaflet-user-marker',
  html: `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: rgba(59, 130, 246, 0.35); animation: leaflet-pulse 2s infinite ease-out;"></div>
      <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: #3B82F6; border: 2.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MapControllerProps {
  onMapReady: (map: L.Map) => void;
  onMapPress?: () => void;
}

function MapController({ onMapReady, onMapPress }: MapControllerProps) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  useEffect(() => {
    if (!onMapPress) return;
    const handleClick = () => {
      onMapPress();
    };
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapPress]);

  return null;
}

export default function LeafletMap({
  userLocation,
  events,
  onMarkerPress,
  onMapPress,
  initialCenter,
  scrollEnabled = true,
  zoomEnabled = true,
  showRecenterButton = true,
  hasBottomPreview = false,
}: AppMapProps) {
  const { theme: appTheme } = useAppTheme();
  const mapRef = useRef<L.Map | null>(null);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  const handleRecenter = useCallback(() => {
    if (userLocation && mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      const targetZoom = Math.max(currentZoom, 14);
      mapRef.current.flyTo([userLocation.latitude, userLocation.longitude], targetZoom, {
        duration: 1,
      });
    }
  }, [userLocation]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      if (!document.getElementById('leaflet-custom-marker-css')) {
        const style = document.createElement('style');
        style.id = 'leaflet-custom-marker-css';
        style.textContent = `
          .custom-leaflet-marker-pin, .custom-leaflet-user-marker {
            background: transparent !important;
            border: none !important;
          }
          @keyframes leaflet-pulse {
            0% {
              transform: scale(0.6);
              opacity: 0.9;
            }
            100% {
              transform: scale(2.2);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  const centerLat = initialCenter?.latitude ?? userLocation?.latitude ?? 46.2276;
  const centerLon = initialCenter?.longitude ?? userLocation?.longitude ?? 2.2137;
  const hasSpecificCenter = !!initialCenter || !!userLocation;

  const center: [number, number] = [centerLat, centerLon];
  const zoom = hasSpecificCenter ? 13 : 5;

  return (
    <View style={styles.container}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={zoomEnabled}
        doubleClickZoom={zoomEnabled}
        dragging={scrollEnabled}
        zoomControl={zoomEnabled}
      >
        <MapController onMapReady={handleMapReady} onMapPress={onMapPress} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userMarkerIcon}>
            <Popup>Ma position</Popup>
          </Marker>
        )}

        {events.map((event) => {
          if (!event.location) return null;
          const isSocial =
            event.type === EventType.EVENT_TYPE_SOCIAL ||
            (event.type as unknown) === 'EVENT_TYPE_SOCIAL';
          const markerIcon = isSocial ? socioMarkerIcon : ecoMarkerIcon;

          return (
            <Marker
              key={event.id}
              position={[event.location.latitude, event.location.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => onMarkerPress?.(event),
              }}
            />
          );
        })}
      </MapContainer>

      {showRecenterButton && userLocation && scrollEnabled && (
        <View
          style={[
            styles.recenterContainer,
            hasBottomPreview && styles.recenterContainerWithPreview,
          ]}
        >
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
  recenterContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 1100,
    borderRadius: theme.radius.full,
    ...theme.shadows.card,
    shadowOpacity: 0.25,
    elevation: 5,
  },
  recenterContainerWithPreview: {
    bottom: 210,
  },
});
