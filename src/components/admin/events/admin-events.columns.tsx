import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import type { Event } from '@volontariapp/contracts';
import { EventType, EventState } from '@volontariapp/contracts';

interface AdminEventsColumnsProps {
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onToggleState: (event: Event) => void;
}

import type { TableColumn } from '@/components/admin/ui/AdminDataTable';

export const getAdminEventsColumns = ({
  onEdit,
  onDelete,
  onToggleState,
}: AdminEventsColumnsProps): TableColumn<Event>[] => [
  {
    key: 'title',
    title: 'Événement',
    flex: 1.5,
    render: (item: Event): React.ReactNode => (
      <View>
        <AppText style={styles.eventTitle}>{item.title}</AppText>
        <AppText style={styles.eventLocSub}>{item.localisationName}</AppText>
      </View>
    ),
  },
  {
    key: 'type',
    title: 'Type',
    flex: 0.8,
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
    flex: 1.0,
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
    flex: 1.0,
    render: (item: Event): React.ReactNode => (
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' }}>
        <Pressable
          onPress={() => {
            onEdit(item);
          }}
          style={({ pressed }: { pressed: boolean }) => [
            styles.actionIconButton,
            { backgroundColor: theme.colors.primaryEco + '15', opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <AppIcons icon="edit-2" iconLibrary="Feather" size={16} color={theme.colors.primaryEco} />
        </Pressable>
        <Pressable
          onPress={() => {
            onDelete(item);
          }}
          style={({ pressed }: { pressed: boolean }) => [
            styles.actionIconButton,
            { backgroundColor: theme.colors.danger + '15', opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <AppIcons icon="trash-2" iconLibrary="Feather" size={16} color={theme.colors.danger} />
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
  actionIconButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
