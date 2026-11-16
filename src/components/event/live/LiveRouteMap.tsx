import React, { useEffect, useRef } from 'react';
import { Modal, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { Coordinates, WalkingRoute } from '@/services/routing.service';
import { LiveRoutePanel } from './LiveRoutePanel';

export interface LiveRouteMapProps {
  title: string;
  origin: Coordinates;
  destination: Coordinates;
  route: WalkingRoute | null;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
}

const EDGE_PADDING = { top: 40, right: 40, bottom: 40, left: 40 };

interface LiveRouteMapViewProps {
  title: string;
  origin: Coordinates;
  destination: Coordinates;
  geometry: Coordinates[] | undefined;
  style: StyleProp<ViewStyle>;
}

function LiveRouteMapView({
  title,
  origin,
  destination,
  geometry,
  style,
}: LiveRouteMapViewProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    const points = geometry !== undefined && geometry.length > 0 ? geometry : [origin, destination];
    mapRef.current?.fitToCoordinates(points, { edgePadding: EDGE_PADDING, animated: false });
  }, [geometry, origin, destination]);

  return (
    <MapView
      ref={mapRef}
      style={style}
      initialRegion={{
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
      showsUserLocation={false}
    >
      <UrlTile
        urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
        flipY={false}
      />
      <Marker coordinate={origin} title="Ma position" pinColor={theme.colors.primarySocio} />
      <Marker coordinate={destination} title={title} pinColor={theme.colors.primaryEco} />
      {geometry !== undefined && geometry.length > 0 && (
        <Polyline coordinates={geometry} strokeColor={theme.colors.primarySocio} strokeWidth={4} />
      )}
    </MapView>
  );
}

/**
 * Trajet a pied vers un evenement, directement en plein ecran : la carte occupe tout l'ecran et le
 * titre, la duree et la distance s'affichent en bandeau par-dessus. Fermer (bouton ou retour
 * Android) efface le trajet selectionne.
 */
export function LiveRouteMap({
  title,
  origin,
  destination,
  route,
  isLoading,
  isError,
  onClose,
}: LiveRouteMapProps): React.JSX.Element {
  const styles = useStyles(createStyles);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} testID="live-route-modal">
      <View style={styles.fullscreen} testID="live-route-fullscreen">
        <LiveRouteMapView
          title={title}
          origin={origin}
          destination={destination}
          geometry={route?.geometry}
          style={styles.map}
        />
        <LiveRoutePanel
          title={title}
          route={route}
          isLoading={isLoading}
          isError={isError}
          onClose={onClose}
        />
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    fullscreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    map: {
      width: '100%',
      height: '100%',
    },
  });
