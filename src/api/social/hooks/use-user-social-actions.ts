import { useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '../social.api';
import { PARTICIPATIONS_QUERY_KEY } from './use-user-participations';
const WISHES_QUERY_KEY = ['user-wishes'];

/**
 * Hook regroupant les mutations pour les interactions sociales de l'utilisateur connecté.
 * Permet de participer à un événement ou de l'ajouter à ses souhaits.
 */
export const useUserSocialActions = () => {
  const queryClient = useQueryClient();

  const participateMutation = useMutation({
    mutationFn: (eventId: string) => socialApi.participate(eventId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PARTICIPATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['participated-events'] });
      void queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const unparticipateMutation = useMutation({
    mutationFn: (eventId: string) => socialApi.unparticipate(eventId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PARTICIPATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['participated-events'] });
      void queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const wishMutation = useMutation({
    mutationFn: (eventId: string) => socialApi.wishEvent(eventId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WISHES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['wished-events'] });
    },
  });

  const unwishMutation = useMutation({
    mutationFn: (eventId: string) => socialApi.unwishEvent(eventId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WISHES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['wished-events'] });
    },
  });

  return {
    participate: participateMutation.mutateAsync,
    isParticipating: participateMutation.isPending,
    unparticipate: unparticipateMutation.mutateAsync,
    isUnparticipating: unparticipateMutation.isPending,
    wish: wishMutation.mutateAsync,
    isWishing: wishMutation.isPending,
    unwish: unwishMutation.mutateAsync,
    isUnwishing: unwishMutation.isPending,
  };
};
