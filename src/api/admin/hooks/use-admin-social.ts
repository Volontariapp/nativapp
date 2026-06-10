import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminSocialApi } from '../admin.social.api';
import type {
  ActionSuccessWebResponse,
  GetUserEventWebResponse,
  GetUserParticipateEventWebResponse,
  GetUserWishEventWebResponse,
} from '@volontariapp/contracts';

interface ParticipateParams {
  userId: string;
  eventId: string;
}

export function useAdminParticipateEvent() {
  const queryClient = useQueryClient();

  return useMutation<ActionSuccessWebResponse, Error, ParticipateParams>({
    mutationFn: ({ userId, eventId }) =>
      adminSocialApi.participate({
        userId,
        eventId,
      }),
    onSuccess: (_, { userId, eventId }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-event-participants', eventId] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-social-participations', userId] });
    },
  });
}

export function useAdminUnparticipateEvent() {
  const queryClient = useQueryClient();

  return useMutation<ActionSuccessWebResponse, Error, ParticipateParams>({
    mutationFn: ({ userId, eventId }) =>
      adminSocialApi.unparticipate({
        userId,
        eventId,
      }),
    onSuccess: (_, { userId, eventId }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-event-participants', eventId] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-social-participations', userId] });
    },
  });
}

interface WishParams {
  userId: string;
  eventId: string;
}

export function useAdminWishEvent() {
  const queryClient = useQueryClient();

  return useMutation<ActionSuccessWebResponse, Error, WishParams>({
    mutationFn: ({ userId, eventId }) =>
      adminSocialApi.wishEvent({
        userId,
        eventId,
      }),
    onSuccess: (_, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-social-wishes', userId] });
    },
  });
}

export function useAdminUnwishEvent() {
  const queryClient = useQueryClient();

  return useMutation<ActionSuccessWebResponse, Error, WishParams>({
    mutationFn: ({ userId, eventId }) =>
      adminSocialApi.unwishEvent({
        userId,
        eventId,
      }),
    onSuccess: (_, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-social-wishes', userId] });
    },
  });
}

interface FollowParams {
  userId: string;
  followedId: string;
}

export function useAdminFollowUser() {
  const queryClient = useQueryClient();

  return useMutation<ActionSuccessWebResponse, Error, FollowParams>({
    mutationFn: ({ userId, followedId }) =>
      adminSocialApi.follow({
        userId,
        followedId,
      }),
    onSuccess: (_, { userId, followedId }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-social-follows', userId] });
      void queryClient.invalidateQueries({ queryKey: ['admin-social-followers', followedId] });
    },
  });
}

export function useAdminUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation<ActionSuccessWebResponse, Error, FollowParams>({
    mutationFn: ({ userId, followedId }) =>
      adminSocialApi.unfollow({
        userId,
        followedId,
      }),
    onSuccess: (_, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-social-follows', userId] });
    },
  });
}

interface BlockParams {
  userId: string;
  blockedId: string;
}

export function useAdminBlockUser() {
  const queryClient = useQueryClient();

  return useMutation<ActionSuccessWebResponse, Error, BlockParams>({
    mutationFn: ({ userId, blockedId }) =>
      adminSocialApi.block({
        userId,
        blockedId,
      }),
    onSuccess: (_, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-social-blocks', userId] });
    },
  });
}

export function useAdminUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation<ActionSuccessWebResponse, Error, BlockParams>({
    mutationFn: ({ userId, blockedId }) =>
      adminSocialApi.unblock({
        userId,
        blockedId,
      }),
    onSuccess: (_, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-social-blocks', userId] });
    },
  });
}

export function useAdminUserParticipatedEvents(userId: string) {
  return useQuery<GetUserParticipateEventWebResponse>({
    queryKey: ['admin-social-participations', userId],
    queryFn: () => adminSocialApi.getUserParticipatedEvents({}, { userId }),
    enabled: !!userId,
  });
}

export function useAdminUserWishedEvents(userId: string) {
  return useQuery<GetUserWishEventWebResponse>({
    queryKey: ['admin-social-wishes', userId],
    queryFn: () => adminSocialApi.getUserWishedEvents({}, { userId }),
    enabled: !!userId,
  });
}

export function useAdminUserFollowers(userId: string) {
  return useQuery<GetUserEventWebResponse>({
    queryKey: ['admin-social-followers', userId],
    queryFn: () => adminSocialApi.getFollowers({}, { userId }),
    enabled: !!userId,
  });
}

export function useAdminUserFollows(userId: string) {
  return useQuery<GetUserEventWebResponse>({
    queryKey: ['admin-social-follows', userId],
    queryFn: () => adminSocialApi.getFollows({}, { userId }),
    enabled: !!userId,
  });
}

export function useAdminUserBlocks(userId: string) {
  return useQuery<GetUserEventWebResponse>({
    queryKey: ['admin-social-blocks', userId],
    queryFn: () => adminSocialApi.getBlocks({}, { userId }),
    enabled: !!userId,
  });
}

export function useAdminUserPosts(userId: string) {
  return useQuery<GetUserEventWebResponse>({
    queryKey: ['admin-social-posts', userId],
    queryFn: () => adminSocialApi.getUserPosts({}, { userId }),
    enabled: !!userId,
  });
}
