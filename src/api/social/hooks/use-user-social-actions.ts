import { useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '../social.api';
import { PARTICIPATIONS_QUERY_KEY } from './use-user-participations';
import { MY_FOLLOWS_QUERY_KEY } from './use-get-my-follows';
import { GET_IS_FOLLOWING_QUERY_KEY } from './use-get-is-following';
import { FOLLOWS_QUERY_KEY } from './use-get-follows';
import { FOLLOWERS_QUERY_KEY } from './use-get-followers';
const WISHES_QUERY_KEY = ['user-wishes'];

/**
 * Hook regroupant les mutations pour les interactions sociales de l'utilisateur connecté.
 * Permet de participer à un événement ou de l'ajouter à ses souhaits.
 */
export const useUserSocialActions = () => {
  const queryClient = useQueryClient();

  const participateMutation = useMutation({
    mutationFn: (eventId: string) => socialApi.participate(eventId),
    onMutate: async (eventId: string) => {
      await queryClient.cancelQueries({ queryKey: ['wished-events'] });
      await queryClient.cancelQueries({ queryKey: ['participated-events'] });
      const previousWished = queryClient.getQueriesData({ queryKey: ['wished-events'] });

      // Retrait optimiste immédiat de la wishlist lors d'une participation
      queryClient.setQueriesData({ queryKey: ['wished-events'] }, (old: unknown) => {
        const typedOld = old as
          { pages?: Array<{ totalCount?: number; events: Array<{ id: string }> }> } | undefined;
        if (!typedOld?.pages) return old;
        return {
          ...typedOld,
          pages: typedOld.pages.map((page) => ({
            ...page,
            totalCount: Math.max(0, (page.totalCount ?? 1) - 1),
            events: page.events.filter((e) => e.id !== eventId),
          })),
        };
      });

      return { previousWished };
    },
    onError: (_err, _eventId, context) => {
      if (context?.previousWished) {
        context.previousWished.forEach(([key, val]) => {
          queryClient.setQueryData(key, val);
        });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PARTICIPATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['participated-events'] });
      void queryClient.invalidateQueries({ queryKey: ['wished-events'] });
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
    onMutate: async (eventId: string) => {
      await queryClient.cancelQueries({ queryKey: ['wished-events'] });
      const previousWished = queryClient.getQueriesData({ queryKey: ['wished-events'] });

      // Retrait optimiste immédiat de la wishlist pour temps réel
      queryClient.setQueriesData({ queryKey: ['wished-events'] }, (old: unknown) => {
        const typedOld = old as
          { pages?: Array<{ totalCount?: number; events: Array<{ id: string }> }> } | undefined;
        if (!typedOld?.pages) return old;
        return {
          ...typedOld,
          pages: typedOld.pages.map((page) => ({
            ...page,
            totalCount: Math.max(0, (page.totalCount ?? 1) - 1),
            events: page.events.filter((e) => e.id !== eventId),
          })),
        };
      });

      return { previousWished };
    },
    onError: (_err, _eventId, context) => {
      if (context?.previousWished) {
        context.previousWished.forEach(([key, val]) => {
          queryClient.setQueryData(key, val);
        });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WISHES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['wished-events'] });
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
