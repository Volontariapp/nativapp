import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { theme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';

interface EventInfoCardsProps {
  event: AppEvent;
}

export function EventInfoCards({ event }: EventInfoCardsProps) {
  let dateString = 'À définir';
  if (event.startAt) {
    try {
      const date = new Date(event.startAt);
      const formattedDate = date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
      const formattedTime = date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      dateString = `${formattedDate}, ${formattedTime}`;
    } catch (e) {
      console.warn('Invalid date format for event.startAt', e);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <AppIcons icon="calendar" iconLibrary="Feather" size={24} color={theme.colors.warning} />
        <AppText style={styles.label}>Date & Time</AppText>
        <AppText style={styles.value} numberOfLines={2}>
          {dateString}
        </AppText>
      </View>

      <View style={styles.card}>
        <AppIcons
          icon="map-pin"
          iconLibrary="Feather"
          size={24}
          color={theme.colors.primarySocio}
        />
        <AppText style={styles.label}>Location</AppText>
        <AppText style={styles.value} numberOfLines={2}>
          {event.localisationName ? event.localisationName : 'Non spécifié'}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.card,
  },
  label: {
    fontSize: 12,
    color: theme.colors.grey,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
  },
});
