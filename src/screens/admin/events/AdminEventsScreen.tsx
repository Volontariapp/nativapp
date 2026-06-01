import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Alert, FlatList, ActivityIndicator } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AdminEventCard } from '@/components/admin/events/AdminEventCard';
import { AdminEventFormModal } from '@/components/admin/events/AdminEventFormModal';
import { AdminEventEditModal } from '@/components/admin/events/AdminEventEditModal';
import { AdminEventDetailsModal } from '@/components/admin/events/AdminEventDetailsModal';
import { AdminEventParticipantsModal } from '@/components/admin/events/AdminEventParticipantsModal';
import type { Event, CreateEventRequest, UpdateEventRequest } from '@volontariapp/contracts';
import { EventState } from '@volontariapp/contracts';
import { areProtobufEnumsDifferent } from '@/shared/lib/protobuf.utils';
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
  const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [managingParticipantsEvent, setManagingParticipantsEvent] = useState<Event | null>(null);

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
    (eventId: string, payload: UpdateEventRequest, newState: EventState): void => {
      updateEventMutation.mutate(
        { eventId, payload },
        {
          onSuccess: () => {
            const isStateDifferent = areProtobufEnumsDifferent(
              newState,
              editingEvent?.state,
              EventState,
            );

            if (isStateDifferent) {
              changeStateMutation.mutate(
                { eventId, newState },
                {
                  onSuccess: () => {
                    setEditModalVisible(false);
                    setEditingEvent(null);
                  },
                },
              );
            } else {
              setEditModalVisible(false);
              setEditingEvent(null);
            }
          },
        },
      );
    },
    [updateEventMutation, changeStateMutation, editingEvent],
  );

  const handleEditPress = useCallback((event: Event): void => {
    setEditingEvent(event);
    setEditModalVisible(true);
  }, []);

  const handleParticipantsPress = useCallback((event: Event): void => {
    setManagingParticipantsEvent(event);
    setParticipantsModalVisible(true);
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

  const currentSelectedEvent = useMemo(() => {
    if (!selectedEvent) return null;
    return eventsList.find((e) => e.id === selectedEvent.id) ?? selectedEvent;
  }, [eventsList, selectedEvent]);

  const renderItem = useCallback(
    ({ item }: { item: Event }) => (
      <AdminEventCard
        event={item}
        onRowPress={handleRowPress}
        onParticipantsPress={handleParticipantsPress}
        onEditPress={handleEditPress}
        onDeletePress={handleDeletePress}
        onToggleState={handleToggleState}
      />
    ),
    [
      handleRowPress,
      handleParticipantsPress,
      handleEditPress,
      handleDeletePress,
      handleToggleState,
    ],
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

      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primarySocio} />
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.cardsContainer}
            data={eventsList}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        )}
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
        event={currentSelectedEvent}
        onClose={() => {
          setDetailsModalVisible(false);
        }}
      />

      <AdminEventParticipantsModal
        visible={participantsModalVisible}
        eventId={managingParticipantsEvent?.id}
        organizerId={managingParticipantsEvent?.organizerId}
        onClose={() => {
          setParticipantsModalVisible(false);
          setManagingParticipantsEvent(null);
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
  listContainer: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
});
