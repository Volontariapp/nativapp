import { useEffect, useRef } from 'react';
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
  WebsocketMessagingType,
} from '@volontariapp/messaging';
import { syncPendingBus } from '../services/event-bus.service';

export const useNotificationHandlers = (
  socket: Socket | null,
  showNotification: (msg: string) => void,
): void => {
  const notifyRef = useRef(showNotification);
  useEffect(() => {
    notifyRef.current = showNotification;
  }, [showNotification]);

  useEffect(() => {
    if (!socket) return;

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

    const handleEventCreated = (data: IEventCreatedWebsocketPayload): void => {
      const msg =
        data.isEmitter === true
          ? 'Votre évènement a été créé avec succès !'
          : "Un nouvel évènement vient d'être publié !";
      notifyRef.current(msg);
    };

    const handleEventDeleted = (data: { isEmitter?: boolean }): void => {
      const msg =
        data.isEmitter === true
          ? 'Votre évènement a bien été supprimé.'
          : 'Un évènement a été supprimé.';
      notifyRef.current(msg);
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
    };

    const handleUserFailed = (): void => {
      notifyRef.current('La création de votre compte a échoué.');
    };

    const handleUserDeletionFailed = (): void => {
      notifyRef.current('La suppression du compte a échoué.');
    };

    // Fallback events (optimistic offline sync success)
    const handleFallbackCreateEvent = (data: IFallbackCreateEventWebsocketPayload): void => {
      syncPendingBus.emit(false);
      const isSuccess = data.status !== 'FAILED';
      notifyRef.current(
        isSuccess
          ? 'Votre évènement a été synchronisé.'
          : 'La synchronisation de votre évènement a échoué.',
      );
    };
    const handleFallbackUpdateEvent = (data: IFallbackUpdateEventWebsocketPayload): void => {
      syncPendingBus.emit(false);
      const isSuccess = data.status !== 'FAILED';
      notifyRef.current(
        isSuccess
          ? 'La modification de votre évènement a été synchronisée.'
          : 'La modification de votre évènement a échoué.',
      );
    };
    const handleFallbackDeleteEvent = (data: IFallbackDeleteEventWebsocketPayload): void => {
      syncPendingBus.emit(false);
      const isSuccess = data.status !== 'FAILED';
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

    socket.on(WebsocketMessagingType.EVENT_CREATED, handleEventCreated);
    socket.on(WebsocketMessagingType.EVENT_DELETED, handleEventDeleted);
    socket.on(WebsocketMessagingType.EVENT_CREATION_FAILED, handleEventFailed);
    socket.on(WebsocketMessagingType.EVENT_DELETION_FAILED, handleEventDeletionFailed);

    socket.on(WebsocketMessagingType.USER_CREATED, handleUserCreated);
    socket.on(WebsocketMessagingType.USER_DELETED, handleUserDeleted);
    socket.on(WebsocketMessagingType.USER_CREATION_FAILED, handleUserFailed);
    socket.on(WebsocketMessagingType.USER_DELETION_FAILED, handleUserDeletionFailed);

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

    return () => {
      socket.off(WebsocketMessagingType.POST_CREATED, handlePostCreated);
      socket.off(WebsocketMessagingType.POST_DELETED, handlePostDeleted);
      socket.off(WebsocketMessagingType.POST_CREATION_FAILED, handlePostFailed);
      socket.off(WebsocketMessagingType.POST_DELETION_FAILED, handlePostDeletionFailed);

      socket.off(WebsocketMessagingType.EVENT_CREATED, handleEventCreated);
      socket.off(WebsocketMessagingType.EVENT_DELETED, handleEventDeleted);
      socket.off(WebsocketMessagingType.EVENT_CREATION_FAILED, handleEventFailed);
      socket.off(WebsocketMessagingType.EVENT_DELETION_FAILED, handleEventDeletionFailed);

      socket.off(WebsocketMessagingType.USER_CREATED, handleUserCreated);
      socket.off(WebsocketMessagingType.USER_DELETED, handleUserDeleted);
      socket.off(WebsocketMessagingType.USER_CREATION_FAILED, handleUserFailed);
      socket.off(WebsocketMessagingType.USER_DELETION_FAILED, handleUserDeletionFailed);

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
    };
  }, [socket]);
};
