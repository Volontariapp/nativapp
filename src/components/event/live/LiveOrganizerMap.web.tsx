import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { formatPositionAge } from '@/hooks/live-organizer.utils';
import type { LiveOrganizerMapProps } from './LiveOrganizerMap';
import {
  labelInitial,
  LIVE_ORGANIZER_APPROXIMATE_NOTE,
  LIVE_ORGANIZER_EMPTY_MESSAGE,
  resolveParticipantLabel,
} from './live-organizer.utils';

export type { LiveOrganizerMapProps };

export function LiveOrganizerMap({
  positions,
  now,
  participants,
}: LiveOrganizerMapProps): React.JSX.Element {
  const styles = useStyles(createStyles);
  const entries = positions.map((position) => ({
    position,
    label: resolveParticipantLabel(position.userId, participants),
    age: formatPositionAge(position.updatedAt, now),
  }));

  return (
    <View style={styles.container} testID="live-organizer-map">
      <AppText style={styles.title}>Participants en route</AppText>
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
