import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import { EventCard } from '@/components/dataDisplay/EventCard';
import { EventStatusBadge } from './EventStatusBadge';

interface MyEventItemProps {
  event: AppEvent;
  onPress: () => void;
  /** Ouvre l'écran de modification de l'évènement. */
  onEdit: () => void;
}

/** Évènement de l'organisateur : sa carte, avec le bouton de modification sur le côté, et son statut au-dessus. */
export function MyEventItem({ event, onPress, onEdit }: MyEventItemProps): React.JSX.Element {
  const styles = useStyles(createStyles);

  return (
    <View>
      <EventStatusBadge
        state={event.state}
        endDate={event.endAt}
        startDate={event.startAt}
        size="sm"
        style={styles.badge}
      />
      <EventCard event={event} onPress={onPress} onEdit={onEdit} />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      marginBottom: theme.spacing.xs,
    },
  });
