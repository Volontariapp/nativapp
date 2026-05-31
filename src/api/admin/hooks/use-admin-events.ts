import { Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminEventApi } from '../admin.event.api';
import type {
  SearchEventsResponse,
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  GetEventResponse,
} from '@volontariapp/contracts';
import { EventState } from '@volontariapp/contracts';

const ADMIN_EVENTS_QUERY_KEY = ['admin', 'events'] as const;
export const ADMIN_EVENTS_COUNT_QUERY_KEY = ['admin', 'events', 'count'] as const;

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

export const useAdminEventsQuery = () => {
  return useQuery<SearchEventsResponse>({
    queryKey: ADMIN_EVENTS_QUERY_KEY,
    queryFn: async () => await adminEventApi.listEvents({ onlyAvailable: false }),
  });
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalise la réponse API en tableau d'Event, quel que soit le shape retourné. */
export const normalizeEventsList = (data: SearchEventsResponse | undefined): Event[] => {
  if (data == null) return [];
  if (Array.isArray(data)) return data as Event[];
  if (Array.isArray(data.events)) return data.events;
  return [];
};

/** Calcule le prochain état à appliquer lors d'un toggle de statut. */
export const resolveNextEventState = (
  current: EventState,
): { nextState: EventState; label: string } => {
  if (
    current === EventState.EVENT_STATE_PUBLISHED ||
    String(current) === EventState[EventState.EVENT_STATE_PUBLISHED]
  ) {
    return { nextState: EventState.EVENT_STATE_CANCELLED, label: 'Annuler' };
  }
  if (
    current === EventState.EVENT_STATE_CANCELLED ||
    String(current) === EventState[EventState.EVENT_STATE_CANCELLED]
  ) {
    return { nextState: EventState.EVENT_STATE_DRAFT, label: 'Passer en Brouillon' };
  }
  return { nextState: EventState.EVENT_STATE_PUBLISHED, label: 'Publier' };
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const useCreateEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateEventRequest) => await adminEventApi.createEvent(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_COUNT_QUERY_KEY });
      Alert.alert('Succès', 'Événement créé avec succès !');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || "Impossible de créer l'événement");
    },
  });
};

export const useUpdateEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, payload }: { eventId: string; payload: UpdateEventRequest }) =>
      await adminEventApi.updateEvent(payload, { id: eventId }),
    onSuccess: (response: GetEventResponse) => {
      if (response.event) {
        const updatedEvent = response.event;
        queryClient.setQueryData<SearchEventsResponse>(ADMIN_EVENTS_QUERY_KEY, (old) => {
          if (!old) return old;
          return {
            ...old,
            events: old.events.map((e) =>
              e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e,
            ),
          };
        });
      }
      void queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_QUERY_KEY });
      Alert.alert('Succès', 'Événement modifié avec succès !');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || "Impossible de modifier l'événement");
    },
  });
};

export const useDeleteEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => await adminEventApi.deleteEvent({ id: eventId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_COUNT_QUERY_KEY });
      Alert.alert('Succès', 'Événement supprimé.');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || "Impossible de supprimer l'événement");
    },
  });
};

export const useChangeEventStateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, newState }: { eventId: string; newState: EventState }) =>
      await adminEventApi.changeEventState({ id: eventId, newState }, { id: eventId }),
    onSuccess: (response: GetEventResponse) => {
      if (response.event) {
        const updatedEvent = response.event;
        queryClient.setQueryData<SearchEventsResponse>(ADMIN_EVENTS_QUERY_KEY, (old) => {
          if (!old) return old;
          return {
            ...old,
            events: old.events.map((e) =>
              e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e,
            ),
          };
        });
      }
      void queryClient.invalidateQueries({ queryKey: ADMIN_EVENTS_QUERY_KEY });
      Alert.alert('Succès', 'Statut mis à jour.');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || 'Impossible de modifier le statut');
    },
  });
};
