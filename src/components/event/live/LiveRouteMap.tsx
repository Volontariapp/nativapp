import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { AppText } from '@/components/typography/AppText';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { Coordinates, WalkingRoute } from '@/services/routing.service';
import { formatWalkDuration } from './live-format.utils';

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
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();

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
        <View style={[styles.panel, { top: insets.top + theme.spacing.md }]}>
          <View style={styles.headerText}>
            <AppText style={styles.title} numberOfLines={1}>
              {`Trajet vers ${title}`}
            </AppText>
            {route !== null && (
              <AppText style={styles.meta}>
                {`${formatWalkDuration(route.durationSeconds)} à pied - ${String(route.distanceMeters)} m`}
              </AppText>
            )}
            {isError && <AppText style={styles.error}>Trajet indisponible pour le moment.</AppText>}
          </View>
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primaryEco}
              testID="live-route-loading"
            />
          )}
          <AppIconsButton
            icon="x"
            size={24}
            variant="white"
            iconColor={theme.colors.grey}
            onPress={onClose}
            accessibilityLabel="Fermer le trajet"
            testID="live-route-fullscreen-close"
          />
        </View>
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
    panel: {
      position: 'absolute',
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      padding: theme.spacing.md,
    },
    headerText: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    meta: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
    error: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.danger,
    },
  });
