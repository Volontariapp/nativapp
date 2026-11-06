import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markEventHandled } from '@/api/event/hooks/use-handled-event-ids';
import { socialApi } from '../social.api';
import { PARTICIPATIONS_QUERY_KEY } from './use-user-participations';
import { MY_FOLLOWS_QUERY_KEY } from './use-get-my-follows';
import { GET_IS_FOLLOWING_QUERY_KEY } from './use-get-is-following';
import { FOLLOWS_QUERY_KEY } from './use-get-follows';
import { FOLLOWERS_QUERY_KEY } from './use-get-followers';
import {
  removeWishedEventOptimistically,
  scheduleWishlistRefresh,
} from '../wishlist-cache';
const WISHES_QUERY_KEY = ['user-wishes'];

/**
 * Hook regroupant les mutations pour les interactions sociales de l'utilisateur connecté.
 * Permet de participer à un événement ou de l'ajouter à ses souhaits.
 */
export const useUserSocialActions = () => {
  const queryClient = useQueryClient();

  const participateMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const result = await socialApi.participate(eventId);
      // Un événement auquel on participe ne doit plus rester dans la wishlist (retrait idempotent).
      // Un échec ici n'annule pas la participation : le rechargement de la wishlist le reflète.
      await socialApi.unwishEvent(eventId).catch(() => undefined);
      return result;
    },
    onMutate: async (eventId: string) => {
      markEventHandled(queryClient, eventId);
      await queryClient.cancelQueries({ queryKey: ['participated-events'] });
      // Retrait optimiste immédiat de la wishlist lors d'une participation
      await removeWishedEventOptimistically(queryClient, eventId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: PARTICIPATIONS_QUERY_KEY,
        refetchType: 'none',
      });
      void queryClient.invalidateQueries({ queryKey: ['participated-events'] });
      void queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'none' });
    },
    // Succès comme échec : le serveur a le dernier mot sur le contenu de la wishlist.
    onSettled: () => {
      scheduleWishlistRefresh(queryClient);
    },
  });

  const unparticipateMutation = useMutation({
    mutationFn: (eventId: string) => socialApi.unparticipate(eventId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: PARTICIPATIONS_QUERY_KEY,
        refetchType: 'none',
      });
      // La liste "En cours" doit perdre l'événement tout de suite, pas au prochain montage.
      void queryClient.invalidateQueries({ queryKey: ['participated-events'] });
      void queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'none' });
    },
  });

  const wishMutation = useMutation({
    mutationFn: (eventId: string) => socialApi.wishEvent(eventId),
    onMutate: (eventId: string) => {
      markEventHandled(queryClient, eventId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WISHES_QUERY_KEY });
    },
    onSettled: () => {
      scheduleWishlistRefresh(queryClient);
    },
  });

  const unwishMutation = useMutation({
    mutationFn: (eventId: string) => socialApi.unwishEvent(eventId),
    onMutate: async (eventId: string) => {
      // Retrait optimiste immédiat de la wishlist pour temps réel
      await removeWishedEventOptimistically(queryClient, eventId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WISHES_QUERY_KEY });
    },
    onSettled: () => {
      scheduleWishlistRefresh(queryClient);
    },
  });

  const followMutation = useMutation({
    mutationFn: (followedId: string) => socialApi.followUser(followedId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_FOLLOWS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: GET_IS_FOLLOWING_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: FOLLOWS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: FOLLOWERS_QUERY_KEY });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (followedId: string) => socialApi.unfollowUser(followedId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_FOLLOWS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: GET_IS_FOLLOWING_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: FOLLOWS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: FOLLOWERS_QUERY_KEY });
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
    follow: followMutation.mutateAsync,
    isFollowingPending: followMutation.isPending,
    unfollow: unfollowMutation.mutateAsync,
    isUnfollowingPending: unfollowMutation.isPending,
  };
};
