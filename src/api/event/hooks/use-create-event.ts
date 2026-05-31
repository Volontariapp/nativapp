import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '../event.api';
import type { CreateEventRequest } from '@volontariapp/contracts';

const EVENTS_QUERY_KEY = ['events'] as const;

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventRequest) => eventApi.createEvent(payload),
    onSuccess: (newEvent) => {
      void queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
      Alert.alert('Succès', `L'évènement "${newEvent.title}" a été créé avec succès !`);
    },
    onError: () => {
      Alert.alert('Erreur', "Impossible de créer l'évènement.");
    },
  });
};
