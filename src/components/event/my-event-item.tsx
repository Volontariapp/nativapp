import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
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

/** Évènement de l'organisateur : sa carte, son statut au-dessus et un bouton de modification sur le côté. */
export function MyEventItem({ event, onPress, onEdit }: MyEventItemProps): React.JSX.Element {
  const { theme } = useAppTheme();
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
      <View style={styles.row}>
        <View style={styles.card}>
          <EventCard event={event} onPress={onPress} />
        </View>
        <Pressable
          style={styles.editButton}
          accessibilityLabel={`Modifier l'évènement ${event.title}`}
          onPress={onEdit}
        >
          <Feather name="edit-2" size={18} color={theme.colors.primaryEco} />
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      marginBottom: theme.spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: theme.spacing.sm,
    },
    card: {
      flex: 1,
    },
    editButton: {
      width: 44,
      // Le bas de la carte porte sa propre marge : le bouton s'arrête au même niveau.
      marginBottom: theme.spacing.md,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
    },
  });
