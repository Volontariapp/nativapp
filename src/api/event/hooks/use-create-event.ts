import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '../event.api';
import type { CreateEventRequest } from '@volontariapp/contracts';
import type { WithOptionalIdempotencyKey } from '../../idempotency.types';
import type { EventFormValues } from '../event.schema';

const EVENTS_QUERY_KEY = ['events'] as const;

const COVER_PENDING_NOTE =
  '\nVotre photo est en cours de vérification : elle apparaîtra dès qu’elle sera validée.';

export interface CreateEventInput extends EventFormValues {
  /** Photo déjà envoyée et confirmée, jamais une URL. */
  coverFileId?: string;
  /** Une clé par formulaire : un réessai après échec reste idempotent côté serveur. */
  idempotencyKey?: string;
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventInput) => {
      const payload: WithOptionalIdempotencyKey<CreateEventRequest> = {
        title: data.title,
        description: data.description,
        localisationName: data.localisationName,
        type: data.type,
        // Champ requis par le contrat mais ignore : les points sont calcules cote serveur (docs/scoring/08).
        awardedImpactScore: 0,
        maxParticipants: data.maxParticipants,
        startAt: data.startAt,
        endAt: data.endAt,
        tagIds: [],
        coverFileId: data.coverFileId,
        idempotencyKey: data.idempotencyKey,
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
        const coverNote = newEvent.coverStatus === 'PENDING' ? COVER_PENDING_NOTE : '';
        Alert.alert(
          'Succès',
          `L'évènement "${newEvent.title}" a été créé avec succès !${coverNote}`,
        );
      }
    },
    onError: (error) => {
      console.error('[useCreateEvent] Mutation error:', error);
      Alert.alert('Erreur', "Impossible de créer l'évènement.");
    },
  });
};
