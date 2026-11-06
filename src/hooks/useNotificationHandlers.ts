import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import {
  type IPostCreatedWebsocketPayload,
  type IPostDeletedWebsocketPayload,
  type IEventCreatedWebsocketPayload,
  type IUserCreatedWebsocketPayload,
  type IFallbackCreateEventWebsocketPayload,
  type IFallbackUpdateEventWebsocketPayload,
  type IFallbackDeleteEventWebsocketPayload,
  type IFallbackChangeEventStateWebsocketPayload,
  type IFallbackManageRequirementsWebsocketPayload,
  type IFallbackCreateTagWebsocketPayload,
  type IFallbackUpdateTagWebsocketPayload,
  type IFallbackDeleteTagWebsocketPayload,
  type ICommentCreatedWebsocketPayload,
  type ICommentDeletedWebsocketPayload,
  type IPostLikedWebsocketPayload,
  type IPostUnlikedWebsocketPayload,
  type IUserBadgeAwardedWebsocketPayload,
  type IUserImpactScoreCreditedWebsocketPayload,
  type IRankingReadyWebsocketPayload,
  type RankingReadyListKind,
  WebsocketMessagingType,
} from '@volontariapp/messaging';
import { COMMENTS_LIST_QUERY_KEY } from '@/api/post/hooks/use-list-comments';
import { invalidateEventLists } from '@/api/event/event-cache';
import { RANKING_EVENTS_QUERY_KEY } from '@/api/ranking/hooks/use-ranking-events';
import { RANKING_FEED_QUERY_KEY } from '@/api/ranking/hooks/use-ranking-feed';
import { invalidateLikesSummary } from '@/api/social/likes-summary.cache';
import { PROFILE_QUERY_KEY } from '@/api/user/hooks/use-profile';
import { authExpiredBus, badgeAwardedBus, syncPendingBus } from '../services/event-bus.service';

const EVENT_LISTS_DEBOUNCE_MS = 500;

export const useNotificationHandlers = (
  socket: Socket | null,
  showNotification: (msg: string) => void,
): void => {
  const queryClient = useQueryClient();
  const notifyRef = useRef(showNotification);
  const rankingDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rankingReadyKindsRef = useRef<Set<RankingReadyListKind>>(new Set());
  const eventListsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rankingAlsoStaleRef = useRef(false);
  useEffect(() => {
    notifyRef.current = showNotification;
  }, [showNotification]);

  useEffect(() => {
    if (!socket) return;

    // Rafales (seed, import) : une seule actualisation des listes une fois le flux calme.
    const refreshEventLists = (options?: { alsoRanking?: boolean }): void => {
      if (options?.alsoRanking === true) {
        rankingAlsoStaleRef.current = true;
      }
      if (eventListsTimerRef.current != null) {
        clearTimeout(eventListsTimerRef.current);
      }
      eventListsTimerRef.current = setTimeout(() => {
        eventListsTimerRef.current = null;
        invalidateEventLists(queryClient);
        if (rankingAlsoStaleRef.current) {
          rankingAlsoStaleRef.current = false;
          void queryClient.invalidateQueries({ queryKey: ['ranking'] });
        }
      }, EVENT_LISTS_DEBOUNCE_MS);
    };

    const handleRankingReady = (data?: IRankingReadyWebsocketPayload): void => {
      // `listKind` absent : emetteur ancien, on ne sait pas quelle liste est prete, donc les deux.
      const kinds: readonly RankingReadyListKind[] =
        data?.listKind === undefined ? ['EVENT', 'POST'] : [data.listKind];
      kinds.forEach((kind) => rankingReadyKindsRef.current.add(kind));
      if (rankingDebounceTimerRef.current != null) {
        clearTimeout(rankingDebounceTimerRef.current);
      }
      rankingDebounceTimerRef.current = setTimeout(() => {
        const ready = rankingReadyKindsRef.current;
        rankingReadyKindsRef.current = new Set();
        if (ready.has('EVENT') && ready.has('POST')) {
          void queryClient.invalidateQueries({ queryKey: ['ranking'] });
        } else if (ready.has('EVENT')) {
          void queryClient.invalidateQueries({ queryKey: RANKING_EVENTS_QUERY_KEY });
        } else if (ready.has('POST')) {
          void queryClient.invalidateQueries({ queryKey: RANKING_FEED_QUERY_KEY });
        }
      }, 1000);
    };

    const handlePostCreated = (data: IPostCreatedWebsocketPayload): void => {
      const msg =
        data.isEmitter === true
          ? 'Votre post a été créé avec succès !'
          : "Un nouveau post vient d'être publié !";
      notifyRef.current(msg);
    };

    const handlePostDeleted = (data: IPostDeletedWebsocketPayload): void => {
      const msg =
        data.isEmitter === true ? 'Votre post a bien été supprimé.' : 'Un post a été supprimé.';
      notifyRef.current(msg);
    };

    const handlePostFailed = (): void => {
      notifyRef.current('La création de votre post a échoué.');
    };

    const handlePostDeletionFailed = (): void => {
      notifyRef.current('La suppression du post a échoué.');
    };

    const handleCommentCreated = (data: ICommentCreatedWebsocketPayload): void => {
      if (data.isEmitter !== true) {
        notifyRef.current('Un nouveau commentaire a été ajouté !');
      }
      void queryClient.invalidateQueries({
        queryKey: [...COMMENTS_LIST_QUERY_KEY, data.postId],
      });
    };

    const handleCommentDeleted = (data: ICommentDeletedWebsocketPayload): void => {
      if (data.isEmitter !== true) {
        notifyRef.current('Un commentaire a été supprimé.');
      }
      void queryClient.invalidateQueries({
        queryKey: [...COMMENTS_LIST_QUERY_KEY, data.postId],
      });
    };

    const handlePostLiked = (data: IPostLikedWebsocketPayload): void => {
      void queryClient.invalidateQueries({
        queryKey: ['post-likers', data.postId],
      });
      invalidateLikesSummary(queryClient, data.postId);
      // Les likes de l'utilisateur courant ne changent que s'il est l'emetteur.
      if (data.isEmitter === true) {
        void queryClient.invalidateQueries({
          queryKey: ['my-likes'],
        });
      }
    };

    const handlePostUnliked = (data: IPostUnlikedWebsocketPayload): void => {
      void queryClient.invalidateQueries({
        queryKey: ['post-likers', data.postId],
      });
      invalidateLikesSummary(queryClient, data.postId);
      // Les likes de l'utilisateur courant ne changent que s'il est l'emetteur.
      if (data.isEmitter === true) {
        void queryClient.invalidateQueries({
          queryKey: ['my-likes'],
        });
      }
    };

    const handleEventCreated = (data: IEventCreatedWebsocketPayload): void => {
      const msg =
        data.isEmitter === true
          ? 'Votre évènement a été créé avec succès !'
          : "Un nouvel évènement vient d'être publié !";
      notifyRef.current(msg);
      refreshEventLists();
    };

    const handleEventDeleted = (data: { eventId?: string; isEmitter?: boolean }): void => {
      const msg =
        data.isEmitter === true
          ? 'Votre évènement a bien été supprimé.'
          : 'Un évènement a été supprimé.';
      notifyRef.current(msg);
      if (data.eventId !== undefined) {
        void queryClient.invalidateQueries({ queryKey: ['event', data.eventId] });
      }
      refreshEventLists({ alsoRanking: true });
    };

    const handleEventFailed = (): void => {
      notifyRef.current('La création de votre évènement a échoué.');
    };

    const handleEventDeletionFailed = (): void => {
      notifyRef.current("La suppression de l'évènement a échoué.");
    };

    const handleUserCreated = (data: IUserCreatedWebsocketPayload): void => {
      const msg =
        data.isEmitter === true
          ? 'Votre compte a été créé avec succès !'
          : "Un nouvel utilisateur vient de s'inscrire !";
      notifyRef.current(msg);
    };

    const handleUserDeleted = (data: { isEmitter?: boolean }): void => {
      const msg =
        data.isEmitter === true ? 'Votre compte a été supprimé.' : 'Un compte a été supprimé.';
      notifyRef.current(msg);
      if (data.isEmitter === true) {
        queryClient.clear();
        authExpiredBus.emit();
      }
    };

    const handleUserFailed = (): void => {
      notifyRef.current('La création de votre compte a échoué.');
    };

    const handleUserDeletionFailed = (): void => {
      notifyRef.current('La suppression du compte a échoué.');
    };

    const handleUserBadgeAwarded = (data: IUserBadgeAwardedWebsocketPayload): void => {
      void queryClient.invalidateQueries({
        queryKey: PROFILE_QUERY_KEY,
      });

      if (data.badges.length > 0) {
        badgeAwardedBus.emit(data.badges);
        const badgeNames = data.badges.map((b) => b.name).join(', ');
        notifyRef.current(`🎉 Félicitations ! Vous avez débloqué le badge : ${badgeNames}`);
      }
    };

    const handleUserImpactScoreCredited = (
      data: IUserImpactScoreCreditedWebsocketPayload,
    ): void => {
      void queryClient.invalidateQueries({
        queryKey: PROFILE_QUERY_KEY,
      });
      notifyRef.current(`+${String(data.scoreIncrement)} points d’impact`);
    };

    // Fallback events (optimistic offline sync success)
    const handleFallbackCreateEvent = (data: IFallbackCreateEventWebsocketPayload): void => {
      syncPendingBus.emit(false);
      const isSuccess = data.status !== 'FAILED';
      if (isSuccess) {
        refreshEventLists();
      }
      notifyRef.current(
        isSuccess
          ? 'Votre évènement a été synchronisé.'
          : 'La synchronisation de votre évènement a échoué.',
      );
    };
    const handleFallbackUpdateEvent = (data: IFallbackUpdateEventWebsocketPayload): void => {
      syncPendingBus.emit(false);
      const isSuccess = data.status !== 'FAILED';
      if (isSuccess) {
        refreshEventLists();
      }
      notifyRef.current(
        isSuccess
          ? 'La modification de votre évènement a été synchronisée.'
          : 'La modification de votre évènement a échoué.',
      );
    };
    const handleFallbackDeleteEvent = (data: IFallbackDeleteEventWebsocketPayload): void => {
      syncPendingBus.emit(false);
      const isSuccess = data.status !== 'FAILED';
      if (isSuccess) {
        refreshEventLists();
      }
      notifyRef.current(
        isSuccess
          ? 'La suppression de votre évènement a été synchronisée.'
          : 'La suppression de votre évènement a échoué.',
      );
    };
    const handleFallbackChangeEventState = (
      data: IFallbackChangeEventStateWebsocketPayload,
    ): void => {
      syncPendingBus.emit(false);
      const isSuccess = data.status !== 'FAILED';
      if (isSuccess) {
        refreshEventLists();
      }
      notifyRef.current(
        isSuccess
          ? 'Le statut de votre évènement a été synchronisé.'
          : 'La synchronisation du statut de votre évènement a échoué.',
      );
    };
    const handleFallbackManageRequirements = (
      data: IFallbackManageRequirementsWebsocketPayload,
    ): void => {
      syncPendingBus.emit(false);
      const isSuccess = data.status !== 'FAILED';
      if (isSuccess) {
        refreshEventLists();
      }
      notifyRef.current(
        isSuccess
          ? 'Les besoins de votre évènement ont été synchronisés.'
          : 'La synchronisation de vos besoins a échoué.',
      );
    };
    const handleFallbackCreateTag = (data: IFallbackCreateTagWebsocketPayload): void => {
      syncPendingBus.emit(false);
      const isSuccess = data.status !== 'FAILED';
      notifyRef.current(
        isSuccess ? 'Votre tag a été synchronisé.' : 'La synchronisation de votre tag a échoué.',
      );
    };
    const handleFallbackUpdateTag = (data: IFallbackUpdateTagWebsocketPayload): void => {
      syncPendingBus.emit(false);
      const isSuccess = data.status !== 'FAILED';
      notifyRef.current(
        isSuccess
          ? 'La modification de votre tag a été synchronisée.'
          : 'La modification de votre tag a échoué.',
      );
    };
    const handleFallbackDeleteTag = (data: IFallbackDeleteTagWebsocketPayload): void => {
      syncPendingBus.emit(false);
      const isSuccess = data.status !== 'FAILED';
      notifyRef.current(
        isSuccess
          ? 'La suppression de votre tag a été synchronisée.'
          : 'La suppression de votre tag a échoué.',
      );
    };

    socket.on(WebsocketMessagingType.POST_CREATED, handlePostCreated);
    socket.on(WebsocketMessagingType.POST_DELETED, handlePostDeleted);
    socket.on(WebsocketMessagingType.POST_CREATION_FAILED, handlePostFailed);
    socket.on(WebsocketMessagingType.POST_DELETION_FAILED, handlePostDeletionFailed);
    socket.on(WebsocketMessagingType.COMMENT_CREATED, handleCommentCreated);
    socket.on(WebsocketMessagingType.COMMENT_DELETED, handleCommentDeleted);
    socket.on(WebsocketMessagingType.POST_LIKED, handlePostLiked);
    socket.on(WebsocketMessagingType.POST_UNLIKED, handlePostUnliked);

    socket.on(WebsocketMessagingType.EVENT_CREATED, handleEventCreated);
    socket.on(WebsocketMessagingType.EVENT_DELETED, handleEventDeleted);
    socket.on(WebsocketMessagingType.EVENT_CREATION_FAILED, handleEventFailed);
    socket.on(WebsocketMessagingType.EVENT_DELETION_FAILED, handleEventDeletionFailed);

    socket.on(WebsocketMessagingType.USER_CREATED, handleUserCreated);
    socket.on(WebsocketMessagingType.USER_DELETED, handleUserDeleted);
    socket.on(WebsocketMessagingType.USER_CREATION_FAILED, handleUserFailed);
    socket.on(WebsocketMessagingType.USER_DELETION_FAILED, handleUserDeletionFailed);
    socket.on(WebsocketMessagingType.USER_BADGE_AWARDED, handleUserBadgeAwarded);
    socket.on(WebsocketMessagingType.USER_IMPACT_SCORE_CREDITED, handleUserImpactScoreCredited);

    socket.on(WebsocketMessagingType.FALLBACK_CREATE_EVENT, handleFallbackCreateEvent);
    socket.on(WebsocketMessagingType.FALLBACK_UPDATE_EVENT, handleFallbackUpdateEvent);
    socket.on(WebsocketMessagingType.FALLBACK_DELETE_EVENT, handleFallbackDeleteEvent);
    socket.on(WebsocketMessagingType.FALLBACK_CHANGE_EVENT_STATE, handleFallbackChangeEventState);
    socket.on(
      WebsocketMessagingType.FALLBACK_MANAGE_REQUIREMENTS,
      handleFallbackManageRequirements,
    );
    socket.on(WebsocketMessagingType.FALLBACK_CREATE_TAG, handleFallbackCreateTag);
    socket.on(WebsocketMessagingType.FALLBACK_UPDATE_TAG, handleFallbackUpdateTag);
    socket.on(WebsocketMessagingType.FALLBACK_DELETE_TAG, handleFallbackDeleteTag);
    socket.on(WebsocketMessagingType.RANKING_READY, handleRankingReady);

    return () => {
      if (rankingDebounceTimerRef.current != null) {
        clearTimeout(rankingDebounceTimerRef.current);
        rankingDebounceTimerRef.current = null;
      }
      rankingReadyKindsRef.current = new Set();
      if (eventListsTimerRef.current != null) {
        clearTimeout(eventListsTimerRef.current);
        eventListsTimerRef.current = null;
      }
      rankingAlsoStaleRef.current = false;
      socket.off(WebsocketMessagingType.POST_CREATED, handlePostCreated);
      socket.off(WebsocketMessagingType.POST_DELETED, handlePostDeleted);
      socket.off(WebsocketMessagingType.POST_CREATION_FAILED, handlePostFailed);
      socket.off(WebsocketMessagingType.POST_DELETION_FAILED, handlePostDeletionFailed);
      socket.off(WebsocketMessagingType.COMMENT_CREATED, handleCommentCreated);
      socket.off(WebsocketMessagingType.COMMENT_DELETED, handleCommentDeleted);
      socket.off(WebsocketMessagingType.POST_LIKED, handlePostLiked);
      socket.off(WebsocketMessagingType.POST_UNLIKED, handlePostUnliked);

      socket.off(WebsocketMessagingType.EVENT_CREATED, handleEventCreated);
      socket.off(WebsocketMessagingType.EVENT_DELETED, handleEventDeleted);
      socket.off(WebsocketMessagingType.EVENT_CREATION_FAILED, handleEventFailed);
      socket.off(WebsocketMessagingType.EVENT_DELETION_FAILED, handleEventDeletionFailed);

      socket.off(WebsocketMessagingType.USER_CREATED, handleUserCreated);
      socket.off(WebsocketMessagingType.USER_DELETED, handleUserDeleted);
      socket.off(WebsocketMessagingType.USER_CREATION_FAILED, handleUserFailed);
      socket.off(WebsocketMessagingType.USER_DELETION_FAILED, handleUserDeletionFailed);
      socket.off(WebsocketMessagingType.USER_BADGE_AWARDED, handleUserBadgeAwarded);
      socket.off(WebsocketMessagingType.USER_IMPACT_SCORE_CREDITED, handleUserImpactScoreCredited);

      socket.off(WebsocketMessagingType.FALLBACK_CREATE_EVENT, handleFallbackCreateEvent);
      socket.off(WebsocketMessagingType.FALLBACK_UPDATE_EVENT, handleFallbackUpdateEvent);
      socket.off(WebsocketMessagingType.FALLBACK_DELETE_EVENT, handleFallbackDeleteEvent);
      socket.off(
        WebsocketMessagingType.FALLBACK_CHANGE_EVENT_STATE,
        handleFallbackChangeEventState,
      );
      socket.off(
        WebsocketMessagingType.FALLBACK_MANAGE_REQUIREMENTS,
        handleFallbackManageRequirements,
      );
      socket.off(WebsocketMessagingType.FALLBACK_CREATE_TAG, handleFallbackCreateTag);
      socket.off(WebsocketMessagingType.FALLBACK_UPDATE_TAG, handleFallbackUpdateTag);
      socket.off(WebsocketMessagingType.FALLBACK_DELETE_TAG, handleFallbackDeleteTag);
      socket.off(WebsocketMessagingType.RANKING_READY, handleRankingReady);
    };
  }, [socket, queryClient]);
};
