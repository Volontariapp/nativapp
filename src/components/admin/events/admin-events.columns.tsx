import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import type { Event } from '@volontariapp/contracts';
import { EventType, EventState } from '@volontariapp/contracts';
import type { TableColumn } from '@/components/admin/ui/AdminDataTable';
import { formatDate } from '@/shared/lib/format-date.utils';

interface AdminEventsColumnsProps {
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onToggleState: (event: Event) => void;
}

export const getAdminEventsColumns = ({
  onEdit,
  onDelete,
  onToggleState,
}: AdminEventsColumnsProps): TableColumn<Event>[] => [
  {
    key: 'title',
    title: 'Événement',
    width: 250,
    render: (item: Event): React.ReactNode => (
      <View>
        <AppText style={styles.eventTitle} numberOfLines={1}>
          {item.title}
        </AppText>
        <AppText style={styles.eventLocSub} numberOfLines={1}>
          {item.localisationName}
        </AppText>
      </View>
    ),
  },
  {
    key: 'dates',
    title: 'Dates',
    width: 200,
    render: (item: Event): React.ReactNode => (
      <View>
        <AppText style={styles.dateText}>
          Début:{' '}
          {formatDate(item.startAt, {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          })}
        </AppText>
        <AppText style={styles.dateText}>
          Fin:{' '}
          {formatDate(item.endAt, {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          })}
        </AppText>
      </View>
    ),
  },
  {
    key: 'type',
    title: 'Type',
    width: 150,
    render: (item: Event): React.ReactNode => {
      const isSocial =
        item.type === EventType.EVENT_TYPE_SOCIAL ||
        String(item.type) === EventType[EventType.EVENT_TYPE_SOCIAL];
      const isEco =
        item.type === EventType.EVENT_TYPE_ECOLOGY ||
        String(item.type) === EventType[EventType.EVENT_TYPE_ECOLOGY];
      const emoji = isSocial ? '🤝' : isEco ? '🌿' : '❓';
      const label = isSocial ? 'Social' : isEco ? 'Écologie' : 'Non défini';
      const bg = isSocial
        ? theme.colors.primarySocio
        : isEco
          ? theme.colors.primaryEco
          : theme.colors.grey;
      return (
        <View style={[styles.typeBadge, { backgroundColor: bg }]}>
          <AppText style={styles.typeEmoji}>{emoji}</AppText>
          <AppText style={styles.typeText}>{label}</AppText>
        </View>
      );
    },
  },
  {
    key: 'state',
    title: 'Statut',
    width: 120,
    render: (item: Event): React.ReactNode => {
      let label = 'Draft';
      let color: string = theme.colors.grey;
      if (item.state === EventState.EVENT_STATE_PUBLISHED) {
        label = 'Published';
        color = theme.colors.success;
      } else if (item.state === EventState.EVENT_STATE_CANCELLED) {
        label = 'Cancelled';
        color = theme.colors.danger;
      }
      return (
        <Pressable
          onPress={() => {
            onToggleState(item);
          }}
          style={[styles.stateBadge, { backgroundColor: color + '15' }]}
        >
          <AppText style={[styles.stateText, { color }]}>{label} ⚙️</AppText>
        </Pressable>
      );
    },
  },
  {
    key: 'actions',
    title: 'Action',
    width: 80,
    render: (item: Event): React.ReactNode => (
      <View style={styles.actionsRow}>
        <Pressable
          hitSlop={8}
          onPress={() => {
            onEdit(item);
          }}
          style={({ pressed }: { pressed: boolean }) => [
            styles.actionIconGhost,
            { opacity: pressed ? 0.5 : 1 },
          ]}
        >
          <AppIcons icon="edit" iconLibrary="Feather" size={20} color={theme.colors.grey} />
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={() => {
            onDelete(item);
          }}
          style={({ pressed }: { pressed: boolean }) => [
            styles.actionIconGhost,
            { opacity: pressed ? 0.5 : 1 },
          ]}
        >
          <AppIcons icon="trash-2" iconLibrary="Feather" size={20} color={theme.colors.danger} />
        </Pressable>
      </View>
    ),
  },
];

const styles = StyleSheet.create({
  eventTitle: {
    fontWeight: '600',
    color: theme.colors.black,
    fontSize: theme.typography.fontSize.sm,
  },
  eventLocSub: { fontSize: 11, color: theme.colors.grey, marginTop: 2 },
  dateText: {
    fontSize: 12,
    color: theme.colors.grey,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  typeEmoji: { fontSize: 12, lineHeight: 16 },
  typeText: { fontSize: 11, fontWeight: '700', color: theme.colors.white, letterSpacing: 0.2 },
  stateBadge: {
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  stateText: { fontSize: 11, fontWeight: '700' },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  actionIconGhost: {
    padding: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
