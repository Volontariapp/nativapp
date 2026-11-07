import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { LiveEventCandidate } from '@/api/event/live-events.utils';
import { LiveEventCard } from './LiveEventCard';

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
        <LiveEventCard
          key={event.id}
          event={event}
          walkSeconds={walkSeconds}
          isEstimated={isEstimated}
          muted
          testID={`live-full-${event.id}`}
        />
      ))}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    heading: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.grey,
    },
  });
