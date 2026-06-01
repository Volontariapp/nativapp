import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { EventState, EventType } from '@volontariapp/contracts';
import type { Event } from '@volontariapp/contracts';
import { formatDate } from '@/shared/lib/format-date.utils';
import { useAdminEventParticipants } from '@/api/admin/hooks/use-admin-event-participants';
import { normalizeUsersList } from '@/api/admin/hooks/use-admin-users';

const EventParticipantBadge = ({ event }: { event: Event }) => {
  const { data } = useAdminEventParticipants({ eventId: event.id, limit: 50 });
  const count = normalizeUsersList(data).length;

  return (
    <View style={styles.participantsBadge}>
      <AppIcons icon="users" iconLibrary="Feather" size={12} color={theme.colors.grey} />
      <AppText style={styles.participantsText}>
        {count} / {event.maxParticipants > 0 ? event.maxParticipants : '∞'}
      </AppText>
    </View>
  );
};

export const AdminEventCard = ({
  event,
  onRowPress,
  onParticipantsPress,
  onEditPress,
  onDeletePress,
  onToggleState,
}: {
  event: Event;
  onRowPress: (event: Event) => void;
  onParticipantsPress: (event: Event) => void;
  onEditPress: (event: Event) => void;
  onDeletePress: (event: Event) => void;
  onToggleState: (event: Event) => void;
}) => {
  const isSocial =
    event.type === EventType.EVENT_TYPE_SOCIAL ||
    String(event.type) === EventType[EventType.EVENT_TYPE_SOCIAL];
  const isEco =
    event.type === EventType.EVENT_TYPE_ECOLOGY ||
    String(event.type) === EventType[EventType.EVENT_TYPE_ECOLOGY];
  const emoji = isSocial ? '🤝' : isEco ? '🌿' : '❓';
  const typeLabel = isSocial ? 'Social' : isEco ? 'Écologie' : 'Non défini';
  const typeBg = isSocial
    ? theme.colors.primarySocio
    : isEco
      ? theme.colors.primaryEco
      : theme.colors.grey;

  let stateLabel = 'Brouillon';
  let stateColor: string = theme.colors.grey;
  if (
    event.state === EventState.EVENT_STATE_PUBLISHED ||
    String(event.state) === EventState[EventState.EVENT_STATE_PUBLISHED]
  ) {
    stateLabel = 'Publié';
    stateColor = theme.colors.success;
  } else if (
    event.state === EventState.EVENT_STATE_CANCELLED ||
    String(event.state) === EventState[EventState.EVENT_STATE_CANCELLED]
  ) {
    stateLabel = 'Annulé';
    stateColor = theme.colors.danger;
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => {
        onRowPress(event);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <AppText style={styles.eventTitle} numberOfLines={1}>
            {event.title}
          </AppText>
          <AppText style={styles.eventLocSub} numberOfLines={1}>
            {event.localisationName}
          </AppText>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            hitSlop={8}
            onPress={() => {
              onParticipantsPress(event);
            }}
            style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.5 : 1 }]}
          >
            <AppIcons icon="users" iconLibrary="Feather" size={18} color={theme.colors.grey} />
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => {
              onEditPress(event);
            }}
            style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.5 : 1 }]}
          >
            <AppIcons icon="edit-2" iconLibrary="Feather" size={18} color={theme.colors.grey} />
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => {
              onDeletePress(event);
            }}
            style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.5 : 1 }]}
          >
            <AppIcons icon="x" iconLibrary="Feather" size={20} color={theme.colors.danger} />
          </Pressable>
        </View>
      </View>

      <View style={styles.cardBody}>
        <AppText style={styles.dateText}>
          Du {formatDate(event.startAt, { day: '2-digit', month: '2-digit', year: '2-digit' })} au{' '}
          {formatDate(event.endAt, { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </AppText>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.typeBadge, { backgroundColor: typeBg }]}>
          <AppText style={styles.typeEmoji}>{emoji}</AppText>
          <AppText style={styles.typeText}>{typeLabel}</AppText>
        </View>
        <Pressable
          onPress={() => {
            onToggleState(event);
          }}
          style={[styles.stateBadge, { backgroundColor: stateColor + '15' }]}
        >
          <AppText style={[styles.stateText, { color: stateColor }]}>{stateLabel} ⚙️</AppText>
        </Pressable>
        <EventParticipantBadge event={event} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    minWidth: 280,
    flex: 1,
    maxWidth: 400,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  cardTitleContainer: {
    flex: 1,
  },
  eventTitle: {
    fontWeight: '600',
    color: theme.colors.black,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: 2,
  },
  eventLocSub: {
    fontSize: 11,
    color: theme.colors.grey,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionButton: {
    padding: 6,
    backgroundColor: theme.colors.lightGrey,
    borderRadius: theme.radius.full,
  },
  deleteButton: {
    padding: 4,
    backgroundColor: theme.colors.lightGrey,
    borderRadius: theme.radius.full,
  },
  cardBody: {
    marginBottom: theme.spacing.md,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.grey,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
  typeEmoji: { fontSize: 12, lineHeight: 16 },
  typeText: { fontSize: 11, fontWeight: '700', color: theme.colors.white, letterSpacing: 0.2 },
  stateBadge: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  stateText: { fontSize: 11, fontWeight: '700' },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.lightGrey,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  participantsText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.grey,
  },
});
