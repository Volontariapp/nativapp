import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AdminDataTable, type TableColumn } from '@/components/admin/ui/AdminDataTable';
import { getAdminEventsColumns } from '@/components/admin/events/admin-events.columns';
import { AdminEventFormModal } from '@/components/admin/events/AdminEventFormModal';
import { AdminEventEditModal } from '@/components/admin/events/AdminEventEditModal';
import { AdminEventDetailsModal } from '@/components/admin/events/AdminEventDetailsModal';
import type { Event, CreateEventRequest, UpdateEventRequest } from '@volontariapp/contracts';
import {
  useAdminEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useChangeEventStateMutation,
  normalizeEventsList,
  resolveNextEventState,
} from '@/api/admin/hooks/use-admin-events';

export default function AdminEventsScreen(): React.JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data, isLoading } = useAdminEventsQuery();
  const createEventMutation = useCreateEventMutation();
  const updateEventMutation = useUpdateEventMutation();
  const deleteEventMutation = useDeleteEventMutation();
  const changeStateMutation = useChangeEventStateMutation();

  const handleCreateEvent = useCallback(
    (payload: CreateEventRequest): void => {
      createEventMutation.mutate(payload, {
        onSuccess: () => {
          setModalVisible(false);
        },
      });
    },
    [createEventMutation],
  );

  const handleUpdateEvent = useCallback(
    (eventId: string, payload: UpdateEventRequest): void => {
      updateEventMutation.mutate(
        { eventId, payload },
        {
          onSuccess: () => {
            setEditModalVisible(false);
            setEditingEvent(null);
          },
        },
      );
    },
    [updateEventMutation],
  );

  const handleEditPress = useCallback((event: Event): void => {
    setEditingEvent(event);
    setEditModalVisible(true);
  }, []);

  const handleRowPress = useCallback((event: Event): void => {
    setSelectedEvent(event);
    setDetailsModalVisible(true);
  }, []);

  const handleDeletePress = useCallback(
    (event: Event): void => {
      Alert.alert(
        'Confirmer la suppression',
        `Voulez-vous vraiment supprimer l'événement "${event.title}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: () => {
              deleteEventMutation.mutate(event.id);
            },
          },
        ],
      );
    },
    [deleteEventMutation],
  );

  const handleToggleState = useCallback(
    (event: Event): void => {
      const { nextState, label } = resolveNextEventState(event.state);
      Alert.alert(
        'Changer le statut',
        `Voulez-vous changer le statut de l'événement vers "${label}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Confirmer',
            onPress: () => {
              changeStateMutation.mutate({ eventId: event.id, newState: nextState });
            },
          },
        ],
      );
    },
    [changeStateMutation],
  );

  const eventsList = useMemo((): Event[] => normalizeEventsList(data), [data]);

  const columns = useMemo(
    (): TableColumn<Event>[] =>
      getAdminEventsColumns({
        onEdit: handleEditPress,
        onDelete: handleDeletePress,
        onToggleState: handleToggleState,
      }),
    [handleEditPress, handleDeletePress, handleToggleState],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <AppText style={styles.headerTitle}>Événements</AppText>
          <AppText style={styles.headerSubtitle}>
            Gestion de toutes les opportunités de bénévolat
          </AppText>
        </View>
        <AppButton
          text="Nouveau"
          variant="eco"
          icon="plus"
          onPress={() => {
            setModalVisible(true);
          }}
        />
      </View>

      <View style={styles.tableContainer}>
        <AdminDataTable<Event>
          data={eventsList}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          onRowPress={handleRowPress}
        />
      </View>

      <AdminEventFormModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
        onSubmit={handleCreateEvent}
        isLoading={createEventMutation.isPending}
      />

      <AdminEventEditModal
        visible={editModalVisible}
        event={editingEvent}
        onClose={() => {
          setEditModalVisible(false);
        }}
        onSubmit={handleUpdateEvent}
        isLoading={updateEventMutation.isPending}
      />

      <AdminEventDetailsModal
        visible={detailsModalVisible}
        event={selectedEvent}
        onClose={() => {
          setDetailsModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.black,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.grey,
    marginTop: theme.spacing.xs,
  },
  tableContainer: { flex: 1, padding: theme.spacing.md },
});
