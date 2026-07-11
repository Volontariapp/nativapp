import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { theme } from '@/shared/themes/theme';
import type { AppMapProps } from './AppMap';

const customMarkerIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="background-color: ${theme.colors.primaryEco}; width: 16px; height: 16px; border-radius: 8px; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const userMarkerIcon = L.divIcon({
  className: 'custom-leaflet-user-marker',
  html: `<div style="background-color: ${theme.colors.primarySocio}; width: 16px; height: 16px; border-radius: 8px; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function LeafletMap({
  userLocation,
  events,
  onMarkerPress,
  initialCenter,
  scrollEnabled = true,
  zoomEnabled = true,
}: AppMapProps) {
  useEffect(() => {
    // Inject Leaflet CSS dynamically to avoid Metro CSS parsing issues with local images
    if (typeof window !== 'undefined' && !document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
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
          return (
            <Marker
              key={event.id}
              position={[event.location.latitude, event.location.longitude]}
              icon={customMarkerIcon}
              eventHandlers={{
                click: () => onMarkerPress?.(event),
              }}
            >
              <Popup>
                <strong>{event.title}</strong>
                <br />
                {event.localisationName}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
