import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { Worklets } from 'react-native-worklets-core';

import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import { useSocket } from './SocketContext';
import {
  WebsocketEventMessagingType,
  type IPostCreatedWebsocketPayload,
  type IPostDeletedWebsocketPayload,
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

  useEffect(() => {
    if (!socket) return;

    const handlePostCreated = (data: IPostCreatedWebsocketPayload & { isEmitter?: boolean }) => {
      const msg =
        data.isEmitter === true
          ? 'Votre post a été créé avec succès !'
          : "Un nouveau post vient d'être publié !";
      showNotification(msg);
    };

    const handlePostDeleted = (data: IPostDeletedWebsocketPayload & { isEmitter?: boolean }) => {
      const msg =
        data.isEmitter === true ? 'Votre post a bien été supprimé.' : 'Un post a été supprimé.';
      showNotification(msg);
    };

    const handlePostFailed = () => {
      showNotification('La création de votre post a échoué.');
    };

    const handlePostDeletionFailed = () => {
      showNotification('La suppression du post a échoué.');
    };

    socket.on(WebsocketEventMessagingType.WS_POST_CREATED, handlePostCreated);
    socket.on(WebsocketEventMessagingType.WS_POST_DELETED, handlePostDeleted);
    socket.on(WebsocketEventMessagingType.WS_POST_CREATION_FAILED, handlePostFailed);
    socket.on(WebsocketEventMessagingType.WS_POST_DELETION_FAILED, handlePostDeletionFailed);

    return () => {
      socket.off(WebsocketEventMessagingType.WS_POST_CREATED, handlePostCreated);
      socket.off(WebsocketEventMessagingType.WS_POST_DELETED, handlePostDeleted);
      socket.off(WebsocketEventMessagingType.WS_POST_CREATION_FAILED, handlePostFailed);
      socket.off(WebsocketEventMessagingType.WS_POST_DELETION_FAILED, handlePostDeletionFailed);
    };
  }, [socket, showNotification]);

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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - react-doctor complains about legacy shadows but boxShadow crashes Reanimated
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
  },
  notificationText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
