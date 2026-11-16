import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { formatPositionAge } from '@/hooks/live-organizer.utils';
import type { LiveOrganizerMapProps } from './LiveOrganizerMap';
import { LiveOrganizerList } from './LiveOrganizerList';
import { LIVE_ORGANIZER_APPROXIMATE_NOTE, resolveParticipantLabel } from './live-organizer.utils';

export type { LiveOrganizerMapProps };

export function LiveOrganizerMap({
  positions,
  now,
  participants,
}: LiveOrganizerMapProps): React.JSX.Element {
  const styles = useStyles(createStyles);
  const entries = positions.map((position) => ({
    userId: position.userId,
    label: resolveParticipantLabel(position.userId, participants),
    age: formatPositionAge(position.updatedAt, now),
  }));

  return (
    <View style={styles.container} testID="live-organizer-map">
      <AppText style={styles.title}>Participants en route</AppText>
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
    note: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
  });
