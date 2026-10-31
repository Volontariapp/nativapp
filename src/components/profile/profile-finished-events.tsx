import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { sortEventsByStartAtDesc } from '@/shared/lib/event-date.utils';
import type { AppTheme } from '@/shared/themes/theme';
import type { PaginatedEventListData } from './profile-events.types';
import { UpcomingEventCard } from './upcoming-event-card';

interface ProfileFinishedEventsProps {
  data: PaginatedEventListData;
  /** Nombre maximum d'évènements affichés ; le compte de l'en-tête reste total. */
  limit?: number;
}

const DEFAULT_LIMIT = 3;

/** Derniers évènements terminés auxquels l'utilisateur a participé, du plus récent au plus ancien. */
export function ProfileFinishedEvents({
  data,
  limit = DEFAULT_LIMIT,
}: ProfileFinishedEventsProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const hasEvents = data.events.length > 0;
  const visibleEvents = useMemo(
    () => sortEventsByStartAtDesc(data.events).slice(0, limit),
    [data.events, limit],
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText style={styles.label} accessibilityRole="header">
          Évènements terminés
        </AppText>
        {hasEvents && (
          <View style={styles.count}>
            <AppText style={styles.countText}>{String(data.events.length)}</AppText>
          </View>
        )}
      </View>

      {data.isLoading ? (
        <ActivityIndicator testID="finished-events-loader" color={theme.colors.primaryEco} />
      ) : hasEvents ? (
        visibleEvents.map((event) => (
          <View key={event.id} style={styles.item}>
            <UpcomingEventCard event={event} />
          </View>
        ))
      ) : (
        <AppText style={styles.emptyText}>Aucun évènement terminé pour le moment.</AppText>
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.grey,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    count: {
      marginLeft: theme.spacing.sm,
      minWidth: 22,
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm - 2,
      paddingVertical: 2,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.badgeGreenBackground,
    },
    countText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primaryEco,
    },
    item: {
      marginBottom: theme.spacing.md,
    },
    emptyText: {
      color: theme.colors.grey,
      fontStyle: 'italic',
      textAlign: 'center',
      marginVertical: theme.spacing.lg,
    },
  });
