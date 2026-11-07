import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { EventState } from '@volontariapp/contracts';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { EventStatusBadge } from '@/components/event/EventStatusBadge';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import { formatParticipantsLabel, formatRemainingTime } from './live-format.utils';

export interface LiveMyEventItem {
  event: AppEvent;
  isOrganizer: boolean;
}

export interface LiveMyEventSectionProps {
  items: LiveMyEventItem[];
  onShowRoute: (event: AppEvent) => void;
  onOpenDetail: (event: AppEvent) => void;
  onOpenMyEvents: () => void;
}

export function LiveMyEventSection({
  items,
  onShowRoute,
  onOpenDetail,
  onOpenMyEvents,
}: LiveMyEventSectionProps): React.JSX.Element | null {
  const styles = useStyles(createStyles);
  const now = useMemo(() => Date.now(), [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} testID="live-my-event-section">
      <AppText style={styles.heading}>MON ÉVÉNEMENT</AppText>
      {items.map(({ event, isOrganizer }) => (
        <View key={event.id} style={styles.card} testID={`live-my-event-${event.id}`}>
          <View style={styles.titleRow}>
            <AppText style={styles.title} numberOfLines={1}>
              {event.title}
            </AppText>
            <EventStatusBadge state={EventState.EVENT_STATE_IN_PROGRESS} size="sm" />
          </View>
          <AppText style={styles.meta}>
            {`${formatRemainingTime(event.endAt, now)} - ${formatParticipantsLabel(event.currentParticipants)}`}
          </AppText>
          <View style={styles.actions}>
            {!isOrganizer && (
              <AppButton
                text="Trajet"
                size="small"
                variant="socio"
                testID={`live-route-${event.id}`}
                onPress={() => {
                  onShowRoute(event);
                }}
              />
            )}
            <AppButton
              text="Détail"
              size="small"
              variant="secondary"
              testID={`live-detail-${event.id}`}
              onPress={() => {
                onOpenDetail(event);
              }}
            />
            <AppButton
              text="Mes évts"
              size="small"
              variant="secondary"
              testID={`live-my-events-${event.id}`}
              onPress={onOpenMyEvents}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    heading: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.grey,
      letterSpacing: 1,
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    title: {
      flex: 1,
      fontSize: 15,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    meta: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
  });
