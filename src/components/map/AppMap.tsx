import { StyleSheet, View } from 'react-native';
import type { Region } from 'react-native-maps';
import MapView, { UrlTile, Marker } from 'react-native-maps';
import { theme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';

export interface AppMapProps {
  userLocation?: { latitude: number; longitude: number };
  events: AppEvent[];
  onMarkerPress?: (event: AppEvent) => void;
  initialCenter?: { latitude: number; longitude: number };
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
}

export default function AppMap({
  userLocation,
  events,
  onMarkerPress,
  initialCenter,
  scrollEnabled = true,
  zoomEnabled = true,
}: AppMapProps) {
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
        style={styles.map}
        initialRegion={initialRegion}
        provider={undefined}
        showsUserLocation={false}
        scrollEnabled={scrollEnabled}
        zoomEnabled={zoomEnabled}
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
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.location.latitude,
                longitude: event.location.longitude,
              }}
              title={event.title}
              description={event.localisationName}
              pinColor={theme.colors.primaryEco}
              onPress={() => onMarkerPress?.(event)}
            />
          );
        })}
      </MapView>
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
});
