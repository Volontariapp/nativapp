import { useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Region } from 'react-native-maps';
import MapView, { UrlTile, Marker } from 'react-native-maps';
import { theme } from '@/shared/themes/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import type { AppEvent } from '@/api/event/event.api';
import { CustomMarker } from './MapPin';
import { EventType } from '@volontariapp/contracts';

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
}: AppMapProps) {
  const { theme: appTheme } = useAppTheme();
  const mapRef = useRef<MapView | null>(null);

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
        onPress={() => onMapPress?.()}
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

        {events.map((event) => {
          if (!event.location) return null;
          return (
            <CustomMarker
              key={`custom-marker-${event.id}`}
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
              onPress={() => onMarkerPress?.(event)}
            />
          );
        })}
      </MapView>

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
    ...theme.shadows.card,
    shadowOpacity: 0.25,
    elevation: 5,
  },
  recenterContainerWithPreview: {
    bottom: 210,
  },
});


