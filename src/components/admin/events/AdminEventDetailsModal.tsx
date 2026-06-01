import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { EventType, EventState } from '@volontariapp/contracts';
import { useAdminEventParticipants } from '@/api/admin/hooks/use-admin-event-participants';
import { normalizeUsersList } from '@/api/admin/hooks/use-admin-users';
import type { Event } from '@volontariapp/contracts';
import { formatDate } from '@/shared/lib/format-date.utils';

interface AdminEventDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  event: Event | null;
}

export function AdminEventDetailsModal({
  visible,
  onClose,
  event,
}: AdminEventDetailsModalProps): React.JSX.Element | null {
  const { data } = useAdminEventParticipants({
    eventId: event?.id ?? '',
    limit: 50,
  });

  if (!event) return null;

  const currentParticipants = normalizeUsersList(data).length;

  const isSocial =
    event.type === EventType.EVENT_TYPE_SOCIAL ||
    String(event.type) === EventType[EventType.EVENT_TYPE_SOCIAL];
  const isEco =
    event.type === EventType.EVENT_TYPE_ECOLOGY ||
    String(event.type) === EventType[EventType.EVENT_TYPE_ECOLOGY];
  const typeLabel = isSocial ? 'Social' : isEco ? 'Écologie' : 'Non défini';

  let stateLabel = 'Draft';
  if (
    event.state === EventState.EVENT_STATE_PUBLISHED ||
    String(event.state) === EventState[EventState.EVENT_STATE_PUBLISHED]
  ) {
    stateLabel = 'Publié';
  } else if (
    event.state === EventState.EVENT_STATE_CANCELLED ||
    String(event.state) === EventState[EventState.EVENT_STATE_CANCELLED]
  ) {
    stateLabel = 'Annulé';
  }

  return (
    <AdminModal
      visible={visible}
      onClose={onClose}
      title="Détails de l'événement"
      scrollable={false}
    >
      <View style={styles.section}>
        <AppText style={styles.label}>Titre</AppText>
        <AppText style={styles.value}>{event.title}</AppText>
      </View>

      <View style={styles.section}>
        <AppText style={styles.label}>Description</AppText>
        <AppText style={styles.value}>{event.description}</AppText>
      </View>

      <View style={styles.row}>
        <View style={styles.flex1}>
          <AppText style={styles.label}>Date de début</AppText>
          <AppText style={styles.value}>{formatDate(event.startAt)}</AppText>
        </View>
        <View style={styles.flex1}>
          <AppText style={styles.label}>Date de fin</AppText>
          <AppText style={styles.value}>{formatDate(event.endAt)}</AppText>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.flex1}>
          <AppText style={styles.label}>Lieu</AppText>
          <AppText style={styles.value}>{event.localisationName}</AppText>
        </View>
        <View style={styles.flex1}>
          <AppText style={styles.label}>Type</AppText>
          <AppText style={styles.value}>{typeLabel}</AppText>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.flex1}>
          <AppText style={styles.label}>Statut</AppText>
          <AppText style={styles.value}>{stateLabel}</AppText>
        </View>
        <View style={styles.flex1}>
          <AppText style={styles.label}>Score d'impact</AppText>
          <AppText style={styles.value}>{event.awardedImpactScore}</AppText>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.flex1}>
          <AppText style={styles.label}>Participants</AppText>
          <AppText style={styles.value}>
            {currentParticipants} / {event.maxParticipants}
          </AppText>
        </View>
        <View style={styles.flex1}>
          <AppText style={styles.label}>Créateur / Organisateur</AppText>
          <AppText style={styles.value}>{event.organizerId ?? 'Non défini'}</AppText>
        </View>
      </View>

      <View style={styles.modalActions}>
        <AppButton text="Fermer" variant="danger" onPress={onClose} />
      </View>
    </AdminModal>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  row: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  section: { marginBottom: theme.spacing.md },
  label: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.grey,
    marginBottom: 4,
  },
  value: { fontSize: theme.typography.fontSize.sm, color: theme.colors.black },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.lg,
  },
});
