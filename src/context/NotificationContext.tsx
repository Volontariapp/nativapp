import React, { createContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { Worklets } from '@/utils/worklets';

import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import { useSocket } from './SocketContext';
import {
  WebsocketEventMessagingType,
  type IPostCreatedWebsocketPayload,
  type IPostDeletedWebsocketPayload,
  type IEventCreatedWebsocketPayload,
  type IUserCreatedWebsocketPayload,
} from '@volontariapp/messaging';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationContextType {
  showNotification: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);
  const translateY = useSharedValue(-150);
  const { socket } = useSocket();
  const insets = useSafeAreaInsets();

  const showNotification = useCallback(
    (msg: string) => {
      setMessage(msg);
      const targetTop = Platform.OS === 'web' ? 20 : Math.max(insets.top + 10, 40);
      translateY.value = withSequence(
        withTiming(targetTop, { duration: 300 }),
        withDelay(
          3000,
          withTiming(-150, { duration: 300 }, (finished) => {
            if (finished === true) {
              void Worklets.runOnJS(() => {
                setMessage(null);
              });
            }
          }),
        ),
      );
    },
    [insets.top, translateY],
  );

  const notifyRef = useRef(showNotification);
  useEffect(() => {
    notifyRef.current = showNotification;
  }, [showNotification]);

  useEffect(() => {
    if (!socket) return;

    const handlePostCreated = (data: IPostCreatedWebsocketPayload & { isEmitter?: boolean }) => {
      const msg =
        data.isEmitter === true
          ? 'Votre post a été créé avec succès !'
          : "Un nouveau post vient d'être publié !";
      notifyRef.current(msg);
    };

    const handlePostDeleted = (data: IPostDeletedWebsocketPayload & { isEmitter?: boolean }) => {
      const msg =
        data.isEmitter === true ? 'Votre post a bien été supprimé.' : 'Un post a été supprimé.';
      notifyRef.current(msg);
    };

    const handlePostFailed = () => {
      notifyRef.current('La création de votre post a échoué.');
    };

    const handlePostDeletionFailed = () => {
      notifyRef.current('La suppression du post a échoué.');
    };

    const handleEventCreated = (data: IEventCreatedWebsocketPayload & { isEmitter?: boolean }) => {
      const msg =
        data.isEmitter === true
          ? 'Votre évènement a été créé avec succès !'
          : "Un nouvel évènement vient d'être publié !";
      notifyRef.current(msg);
    };

    const handleUserCreated = (data: IUserCreatedWebsocketPayload & { isEmitter?: boolean }) => {
      const msg =
        data.isEmitter === true
          ? 'Votre compte a été créé avec succès !'
          : "Un nouvel utilisateur vient de s'inscrire !";
      notifyRef.current(msg);
    };

    socket.on(WebsocketEventMessagingType.WS_POST_CREATED, handlePostCreated);
    socket.on(WebsocketEventMessagingType.WS_POST_DELETED, handlePostDeleted);
    socket.on(WebsocketEventMessagingType.WS_POST_CREATION_FAILED, handlePostFailed);
    socket.on(WebsocketEventMessagingType.WS_POST_DELETION_FAILED, handlePostDeletionFailed);
    socket.on(WebsocketEventMessagingType.WS_EVENT_CREATED, handleEventCreated);
    socket.on(WebsocketEventMessagingType.WS_USER_CREATED, handleUserCreated);

    return () => {
      socket.off(WebsocketEventMessagingType.WS_POST_CREATED, handlePostCreated);
      socket.off(WebsocketEventMessagingType.WS_POST_DELETED, handlePostDeleted);
      socket.off(WebsocketEventMessagingType.WS_POST_CREATION_FAILED, handlePostFailed);
      socket.off(WebsocketEventMessagingType.WS_POST_DELETION_FAILED, handlePostDeletionFailed);
      socket.off(WebsocketEventMessagingType.WS_EVENT_CREATED, handleEventCreated);
      socket.off(WebsocketEventMessagingType.WS_USER_CREATED, handleUserCreated);
    };
  }, [socket]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const contextValue = useMemo(() => ({ showNotification }), [showNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {message != null && (
        <Animated.View style={[styles.notificationContainer, animatedStyle]}>
          <AppText style={styles.notificationText}>{message}</AppText>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: theme.colors.primaryEco,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    zIndex: 9999,
  },
  notificationText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
