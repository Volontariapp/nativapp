import React, { createContext, useState, useMemo, useCallback } from 'react';
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
import { useNotificationHandlers } from '../hooks/useNotificationHandlers';
import { badgeAwardedBus } from '../services/event-bus.service';
import { useSyncPendingIndicator } from '../hooks/use-sync-pending-indicator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native';
import { BadgeCelebrationModal } from '@/components/feedback/BadgeCelebrationModal';
import { BADGE_REGISTRY } from '@/components/dataDisplay/badge/badge.config';
import type { BadgeVariant } from '@/components/dataDisplay/badge/badge.types';

/** Badge montré dans la modale de félicitations, avec les points crédités s'il y en a. */
interface AwardedBadge {
  variant: BadgeVariant;
  points?: number;
}

interface NotificationContextType {
  showNotification: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);
  const isSyncing = useSyncPendingIndicator();
  const [awardedBadge, setAwardedBadge] = useState<AwardedBadge | null>(null);
  const translateY = useSharedValue(-150);
  const { socket } = useSocket();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    const unsubscribeBadge = badgeAwardedBus.subscribe((badges) => {
      const first = badges.find((b) => b.slug in BADGE_REGISTRY);
      if (first) {
        setAwardedBadge({ variant: first.slug as BadgeVariant, points: first.points });
      }
    });
    return () => {
      unsubscribeBadge();
    };
  }, []);

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

  useNotificationHandlers(socket, showNotification);

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
      {isSyncing && (
        <Animated.View style={styles.syncOverlay}>
          <ActivityIndicator size="small" color={theme.colors.white} />
          <AppText style={styles.syncText}>Synchronisation en cours...</AppText>
        </Animated.View>
      )}
      {awardedBadge != null && (
        <BadgeCelebrationModal
          visible={true}
          variant={awardedBadge.variant}
          points={awardedBadge.points}
          onClose={() => {
            setAwardedBadge(null);
          }}
        />
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
  syncOverlay: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryEco,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    zIndex: 9999,
  },
  syncText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
});
