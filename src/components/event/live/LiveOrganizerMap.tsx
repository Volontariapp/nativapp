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
import {
  labelInitial,
  LIVE_ORGANIZER_APPROXIMATE_NOTE,
  LIVE_ORGANIZER_EMPTY_MESSAGE,
  resolveParticipantLabel,
} from './live-organizer.utils';

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
      {entries.length === 0 ? (
        <AppText style={styles.empty}>{LIVE_ORGANIZER_EMPTY_MESSAGE}</AppText>
      ) : (
        <View style={styles.list}>
          {entries.map(({ position, label, age }) => (
            <View key={position.userId} style={styles.row}>
              <View style={styles.avatar}>
                <AppText style={styles.avatarText}>{labelInitial(label)}</AppText>
              </View>
              <AppText style={styles.rowLabel} numberOfLines={1}>
                {label}
              </AppText>
              <AppText style={styles.rowAge}>{age}</AppText>
            </View>
          ))}
        </View>
      )}
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
    empty: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.grey,
    },
    list: {
      gap: theme.spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    avatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primarySocio,
    },
    avatarText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.white,
    },
    rowLabel: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    rowAge: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
    note: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
  });
