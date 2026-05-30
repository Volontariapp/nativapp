import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminEventApi } from '@/api/admin/admin.event.api';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AdminDataTable, type TableColumn } from '@/components/admin/ui/AdminDataTable';
import { getAdminEventsColumns } from '@/components/admin/events/admin-events.columns';
import { AdminEventFormModal } from '@/components/admin/events/AdminEventFormModal';
import { AdminEventEditModal } from '@/components/admin/events/AdminEventEditModal';
import type {
  SearchEventsResponse,
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  GetEventResponse,
} from '@volontariapp/contracts';
import { EventState } from '@volontariapp/contracts';

export default function AdminEventsScreen(): React.JSX.Element {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const { data, isLoading } = useQuery<SearchEventsResponse>({
    queryKey: ['admin', 'events'],
    queryFn: async () => await adminEventApi.listEvents({ onlyAvailable: false }),
  });

  const createEventMutation = useMutation({
    mutationFn: async (payload: CreateEventRequest) => await adminEventApi.createEvent(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events', 'count'] });
      setModalVisible(false);
      Alert.alert('Succès', 'Événement créé avec succès !');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || "Impossible de créer l'événement");
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ eventId, payload }: { eventId: string; payload: UpdateEventRequest }) =>
      await adminEventApi.updateEvent(payload, { id: eventId }),
    onSuccess: (response: GetEventResponse) => {
      if (response.event) {
        const updatedEvent = response.event;
        queryClient.setQueryData<SearchEventsResponse>(['admin', 'events'], (old) => {
          if (!old) return old;
          return {
            ...old,
            events: old.events.map((e) =>
              e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e,
            ),
          };
        });
      }
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      setEditModalVisible(false);
      setEditingEvent(null);
      Alert.alert('Succès', 'Événement modifié avec succès !');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || "Impossible de modifier l'événement");
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => await adminEventApi.deleteEvent({ id: eventId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events', 'count'] });
      Alert.alert('Succès', 'Événement supprimé.');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || "Impossible de supprimer l'événement");
    },
  });

  const changeStateMutation = useMutation({
    mutationFn: async ({ eventId, newState }: { eventId: string; newState: EventState }) =>
      await adminEventApi.changeEventState({ id: eventId, newState }, { id: eventId }),
    onSuccess: (response: GetEventResponse) => {
      if (response.event) {
        const updatedEvent = response.event;
        queryClient.setQueryData<SearchEventsResponse>(['admin', 'events'], (old) => {
          if (!old) return old;
          return {
            ...old,
            events: old.events.map((e) =>
              e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e,
            ),
          };
        });
      }
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      Alert.alert('Succès', 'Statut mis à jour.');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || 'Impossible de modifier le statut');
    },
  });

  const handleCreateEvent = (payload: CreateEventRequest): void => {
    createEventMutation.mutate(payload);
  };

  const handleUpdateEvent = (eventId: string, payload: UpdateEventRequest): void => {
    updateEventMutation.mutate({ eventId, payload });
  };

  const handleEditPress = (event: Event): void => {
    setEditingEvent(event);
    setEditModalVisible(true);
  };

  const handleDeletePress = (event: Event): void => {
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
  };

  const handleToggleState = (event: Event): void => {
    const currentState = event.state;
    let nextState: EventState = EventState.EVENT_STATE_PUBLISHED;
    let stateLabel = 'Publier';

    if (currentState === EventState.EVENT_STATE_PUBLISHED) {
      nextState = EventState.EVENT_STATE_CANCELLED;
      stateLabel = 'Annuler';
    } else if (currentState === EventState.EVENT_STATE_CANCELLED) {
      nextState = EventState.EVENT_STATE_DRAFT;
      stateLabel = 'Passer en Brouillon';
    }

    Alert.alert(
      'Changer le statut',
      `Voulez-vous changer le statut de l'événement vers "${stateLabel}" ?`,
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
  };

  const eventsList = useMemo((): Event[] => {
    if (data == null) return [];
    const unknownData = data as unknown;
    if (Array.isArray(unknownData)) return unknownData as Event[];
    const obj = unknownData as Record<string, unknown>;
    if (Array.isArray(obj.events)) return obj.events as Event[];
    if (Array.isArray(obj.data)) return obj.data as Event[];
    if (Array.isArray(obj.items)) return obj.items as Event[];
    return [];
  }, [data]);

  const columns = useMemo(
    (): TableColumn<Event>[] =>
      getAdminEventsColumns({
        onEdit: handleEditPress,
        onDelete: handleDeletePress,
        onToggleState: handleToggleState,
      }),
    [],
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
