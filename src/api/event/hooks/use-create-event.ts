import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '../event.api';
import type { CreateEventRequest } from '@volontariapp/contracts';
import type { EventFormValues } from '../event.schema';

const EVENTS_QUERY_KEY = ['events'] as const;

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EventFormValues) => {
      const payload: CreateEventRequest = {
        title: data.title,
        description: data.description,
        localisationName: data.localisationName,
        type: data.type,
        awardedImpactScore: data.awardedImpactScore,
        maxParticipants: data.maxParticipants,
        startAt: data.startAt,
        endAt: data.endAt,
        tagIds: [],
      };

      const newEvent = await eventApi.createEvent(payload);

      if (newEvent !== null && data.requirements.length > 0) {
        console.log(
          `[useCreateEvent] Adding ${String(data.requirements.length)} requirements to event ${newEvent.id}`,
        );
        await Promise.all(
          data.requirements.map((req) =>
            eventApi.addRequirement(newEvent.id, {
              name: req.name,
              description: req.description,
              neededQuantity: req.neededQuantity,
            }),
          ),
        );
      }

      return newEvent;
    },
    onSuccess: (newEvent) => {
      if (newEvent !== null) {
        void queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
        void queryClient.invalidateQueries({ queryKey: ['my-events'] });
        Alert.alert('Succès', `L'évènement "${newEvent.title}" a été créé avec succès !`);
      }
    },
    onError: (error) => {
      console.error('[useCreateEvent] Mutation error:', error);
      Alert.alert('Erreur', "Impossible de créer l'évènement.");
    },
  });
};
