import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import type { LiveSharingState } from '@/hooks/live-sharing.types';
import { LiveEventCard } from './LiveEventCard';
import { LiveEventIconActions } from './LiveEventIconActions';
import { LiveSharingToggle } from './LiveSharingToggle';

export interface LiveMyEventItem {
  event: AppEvent;
  isOrganizer: boolean;
}

export interface LiveMyEventSectionProps {
  items: LiveMyEventItem[];
  onShowRoute: (event: AppEvent) => void;
  onOpenDetail: (event: AppEvent) => void;
  /** Quitter l'evenement (participant uniquement) ; absent : pas de bouton. */
  onLeave?: (event: AppEvent) => void;
  leavingEventId?: string | null;
  /** Etat du partage de position ; absent : pas de bascule. */
  sharing?: LiveSharingState;
  onToggleSharing?: (event: AppEvent, enabled: boolean) => void;
}

export function LiveMyEventSection({
  items,
  onShowRoute,
  onOpenDetail,
  onLeave,
  leavingEventId = null,
  sharing,
  onToggleSharing,
}: LiveMyEventSectionProps): React.JSX.Element | null {
  const styles = useStyles(createStyles);

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} testID="live-my-event-section">
      <AppText style={styles.heading}>MON ÉVÉNEMENT</AppText>
      {items.map(({ event, isOrganizer }) => (
        <LiveEventCard
          key={event.id}
          event={event}
          testID={`live-my-event-${event.id}`}
          footer={
            !isOrganizer && sharing !== undefined && onToggleSharing !== undefined ? (
              <LiveSharingToggle
                eventId={event.id}
                status={sharing.activeEventId === event.id ? sharing.status : 'idle'}
                lastStop={sharing.lastStop}
                onToggle={(enabled) => {
                  onToggleSharing(event, enabled);
                }}
              />
            ) : undefined
          }
        >
          <LiveEventIconActions
            eventId={event.id}
            onShowRoute={
              isOrganizer
                ? undefined
                : () => {
                    onShowRoute(event);
                  }
            }
            onOpenDetail={() => {
              onOpenDetail(event);
            }}
          />
          {!isOrganizer && onLeave !== undefined && (
            <View style={styles.leave}>
              <AppButton
                text="Quitter l'événement"
                size="small"
                variant="danger"
                loading={leavingEventId === event.id}
                testID={`live-leave-${event.id}`}
                onPress={() => {
                  onLeave(event);
                }}
              />
            </View>
          )}
        </LiveEventCard>
      ))}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    heading: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.grey,
      letterSpacing: 1,
      marginBottom: theme.spacing.sm,
    },
    leave: {
      flex: 1,
      alignItems: 'flex-end',
      paddingLeft: theme.spacing.sm,
    },
  });
