import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import type { UserWeb } from '@volontariapp/contracts';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { Coordinates } from '@/services/routing.service';
import type { LiveOrganizerPosition } from '@/hooks/live-organizer.types';
import { formatPositionAge } from '@/hooks/live-organizer.utils';
import { LiveOrganizerList } from './LiveOrganizerList';
import { LIVE_ORGANIZER_APPROXIMATE_NOTE, resolveParticipantLabel } from './live-organizer.utils';

export interface LiveOrganizerMapProps {
  eventTitle: string;
  eventLocation: Coordinates;
  positions: readonly LiveOrganizerPosition[];
  now: number;
  /** Participants deja charges par l'ecran : source des noms affiches. */
  participants: readonly Pick<UserWeb, 'id' | 'pseudo'>[];
}

export function LiveOrganizerMap({
  eventTitle,
  eventLocation,
  positions,
  now,
  participants,
}: LiveOrganizerMapProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const entries = positions.map((position) => ({
    userId: position.userId,
    position,
    label: resolveParticipantLabel(position.userId, participants),
    age: formatPositionAge(position.updatedAt, now),
  }));

  return (
    <View style={styles.container} testID="live-organizer-map">
      <AppText style={styles.title}>Participants en route</AppText>
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: eventLocation.latitude,
            longitude: eventLocation.longitude,
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
          <Marker
            coordinate={eventLocation}
            title={eventTitle}
            pinColor={theme.colors.primaryEco}
          />
          {entries.map(({ position, label, age }) => (
            <Marker
              key={position.userId}
              coordinate={{ latitude: position.latitude, longitude: position.longitude }}
              title={label}
              description={age}
              pinColor={theme.colors.primarySocio}
            />
          ))}
        </MapView>
      </View>
      <LiveOrganizerList entries={entries} />
      <AppText style={styles.note}>{LIVE_ORGANIZER_APPROXIMATE_NOTE}</AppText>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    mapWrapper: {
      height: 220,
      borderRadius: theme.radius.md,
      overflow: 'hidden',
    },
    map: {
      width: '100%',
      height: '100%',
    },
    note: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
  });
