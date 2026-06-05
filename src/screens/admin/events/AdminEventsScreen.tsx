import React, { useReducer, useMemo, useCallback } from 'react';
import { View, StyleSheet, Alert, FlatList, ActivityIndicator } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import {
  AdminEventCard,
  AdminEventFormModal,
  AdminEventEditModal,
  AdminEventDetailsModal,
  AdminEventParticipantsModal,
} from '@/components/admin/events';
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

interface AdminEventsState {
  modalVisible: boolean;
  editModalVisible: boolean;
  detailsModalVisible: boolean;
  participantsModalVisible: boolean;
  editingEvent: Event | null;
  selectedEvent: Event | null;
  managingParticipantsEvent: Event | null;
}

type AdminEventsAction =
  | { type: 'OPEN_CREATE' }
  | { type: 'CLOSE_CREATE' }
  | { type: 'OPEN_EDIT'; event: Event }
  | { type: 'CLOSE_EDIT' }
  | { type: 'OPEN_DETAILS'; event: Event }
  | { type: 'CLOSE_DETAILS' }
  | { type: 'OPEN_PARTICIPANTS'; event: Event }
  | { type: 'CLOSE_PARTICIPANTS' };

const initialState: AdminEventsState = {
  modalVisible: false,
  editModalVisible: false,
  detailsModalVisible: false,
  participantsModalVisible: false,
  editingEvent: null,
  selectedEvent: null,
  managingParticipantsEvent: null,
};

function eventsReducer(state: AdminEventsState, action: AdminEventsAction): AdminEventsState {
  switch (action.type) {
    case 'OPEN_CREATE':
      return { ...state, modalVisible: true };
    case 'CLOSE_CREATE':
      return { ...state, modalVisible: false };
    case 'OPEN_EDIT':
      return { ...state, editModalVisible: true, editingEvent: action.event };
    case 'CLOSE_EDIT':
      return { ...state, editModalVisible: false, editingEvent: null };
    case 'OPEN_DETAILS':
      return { ...state, detailsModalVisible: true, selectedEvent: action.event };
    case 'CLOSE_DETAILS':
      return { ...state, detailsModalVisible: false };
    case 'OPEN_PARTICIPANTS':
      return { ...state, participantsModalVisible: true, managingParticipantsEvent: action.event };
    case 'CLOSE_PARTICIPANTS':
      return { ...state, participantsModalVisible: false, managingParticipantsEvent: null };
    default:
      return state;
  }
}

export default function AdminEventsScreen(): React.JSX.Element {
  const [state, dispatch] = useReducer(eventsReducer, initialState);
  const {
    modalVisible,
    editModalVisible,
    detailsModalVisible,
    participantsModalVisible,
    editingEvent,
    selectedEvent,
    managingParticipantsEvent,
  } = state;

  const { data, isLoading } = useAdminEventsQuery();
  const createEventMutation = useCreateEventMutation();
  const updateEventMutation = useUpdateEventMutation();
  const deleteEventMutation = useDeleteEventMutation();
  const changeStateMutation = useChangeEventStateMutation();

  const handleCreateEvent = useCallback(
    (payload: CreateEventRequest): void => {
      createEventMutation.mutate(payload, {
        onSuccess: () => {
          dispatch({ type: 'CLOSE_CREATE' });
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
                    dispatch({ type: 'CLOSE_EDIT' });
                  },
                },
              );
            } else {
              dispatch({ type: 'CLOSE_EDIT' });
            }
          },
        },
      );
    },
    [updateEventMutation, changeStateMutation, editingEvent],
  );

  const handleEditPress = useCallback((event: Event): void => {
    dispatch({ type: 'OPEN_EDIT', event });
  }, []);

  const handleParticipantsPress = useCallback((event: Event): void => {
    dispatch({ type: 'OPEN_PARTICIPANTS', event });
  }, []);

  const handleRowPress = useCallback((event: Event): void => {
    dispatch({ type: 'OPEN_DETAILS', event });
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
            dispatch({ type: 'OPEN_CREATE' });
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
          dispatch({ type: 'CLOSE_CREATE' });
        }}
        onSubmit={handleCreateEvent}
        isLoading={createEventMutation.isPending}
      />

      <AdminEventEditModal
        visible={editModalVisible}
        event={editingEvent}
        onClose={() => {
          dispatch({ type: 'CLOSE_EDIT' });
        }}
        onSubmit={handleUpdateEvent}
        isLoading={updateEventMutation.isPending}
      />

      <AdminEventDetailsModal
        visible={detailsModalVisible}
        event={currentSelectedEvent}
        onClose={() => {
          dispatch({ type: 'CLOSE_DETAILS' });
        }}
      />

      <AdminEventParticipantsModal
        visible={participantsModalVisible}
        eventId={managingParticipantsEvent?.id}
        organizerId={managingParticipantsEvent?.organizerId}
        onClose={() => {
          dispatch({ type: 'CLOSE_PARTICIPANTS' });
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
