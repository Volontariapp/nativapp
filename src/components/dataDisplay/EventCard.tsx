import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import { mapEventType, mapEventState } from '@/shared/lib/event-mappers.utils';

export interface EventCardProps {
  event: AppEvent;
}

export function EventCard({ event }: EventCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <AppText style={styles.cardTitle}>{event.title}</AppText>
      <View style={styles.badgeContainer}>
        <View style={[styles.badge, styles.typeBadge]}>
          <AppText style={styles.badgeText}>{mapEventType(event.type)}</AppText>
        </View>
        <View style={[styles.badge, styles.stateBadge]}>
          <AppText style={styles.badgeText}>{mapEventState(event.state)}</AppText>
        </View>
      </View>

      <AppText style={styles.cardDescription}>{event.description}</AppText>

      <View style={styles.infoRow}>
        <AppText style={styles.infoLabel}>Lieu:</AppText>
        <AppText style={styles.infoValue}>{event.localisationName}</AppText>
      </View>
      {event.location && (
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Coordonnées:</AppText>
          <AppText style={styles.infoValue}>
            {event.location.latitude.toFixed(4)}, {event.location.longitude.toFixed(4)}
          </AppText>
        </View>
      )}
      <View style={styles.infoRow}>
        <AppText style={styles.infoLabel}>Début:</AppText>
        <AppText style={styles.infoValue}>
          {new Date(event.startAt).toLocaleString('fr-FR')}
        </AppText>
      </View>
      <View style={styles.infoRow}>
        <AppText style={styles.infoLabel}>Fin:</AppText>
        <AppText style={styles.infoValue}>{new Date(event.endAt).toLocaleString('fr-FR')}</AppText>
      </View>
      <View style={styles.infoRow}>
        <AppText style={styles.infoLabel}>Participants:</AppText>
        <AppText style={styles.infoValue}>
          {event.currentParticipants} / {event.maxParticipants}
        </AppText>
      </View>
      <View style={styles.infoRow}>
        <AppText style={styles.infoLabel}>Impact Score:</AppText>
        <AppText style={styles.infoValue}>{event.awardedImpactScore}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  typeBadge: {
    backgroundColor: `${theme.colors.primaryEco}20`, // 20% opacity
  },
  stateBadge: {
    backgroundColor: `${theme.colors.grey}20`,
  },
  badgeText: {
    fontSize: 12,
    color: theme.colors.black,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.grey,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.grey,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.black,
  },
});
