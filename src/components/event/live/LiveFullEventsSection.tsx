import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { LiveEventCandidate } from '@/api/event/live-events.utils';
import { formatParticipantsCount, formatWalkDuration } from './live-format.utils';

export interface LiveFullEventsSectionProps {
  candidates: LiveEventCandidate[];
}

/** Evenements complets : grises, aucune action de participation (D4). */
export function LiveFullEventsSection({
  candidates,
}: LiveFullEventsSectionProps): React.JSX.Element | null {
  const styles = useStyles(createStyles);

  if (candidates.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} testID="live-full-section">
      <AppText style={styles.heading}>Autres événements (complets)</AppText>
      {candidates.map(({ event, walkSeconds, isEstimated }) => (
        <View key={event.id} style={styles.row} testID={`live-full-${event.id}`}>
          <AppText style={styles.title} numberOfLines={1}>
            {event.title}
          </AppText>
          <AppText style={styles.meta}>
            {isEstimated
              ? `${formatWalkDuration(walkSeconds)} (estimé)`
              : formatWalkDuration(walkSeconds)}
          </AppText>
          <AppText style={styles.meta}>{formatParticipantsCount(event)}</AppText>
        </View>
      ))}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing.lg,
      gap: theme.spacing.sm,
      opacity: 0.6,
    },
    heading: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.grey,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.lightGrey,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
    },
    title: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.grey,
    },
    meta: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
  });
