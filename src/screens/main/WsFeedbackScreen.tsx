import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import { useSocket } from '@/context/SocketContext';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcons } from '@/components/media/AppIcons';

interface WsEvent {
  id: string;
  eventName: string;
  payload: unknown;
  receivedAt: Date;
}

const EVENT_NAMES = ['ws.user.created', 'ws.event.created', 'unauthorized', 'connect_error'];

const EVENT_COLORS: Record<string, string> = {
  'ws.user.created': '#2f6e3e',
  'ws.event.created': '#1f6f8b',
  unauthorized: '#CC3E14',
  connect_error: '#e45600',
};

function EventCard({ event }: { event: WsEvent }): React.JSX.Element {
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(-20);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 350 });
    slideAnim.value = withSpring(0, { damping: 10, stiffness: 80 });
  }, [fadeAnim, slideAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const color = EVENT_COLORS[event.eventName] ?? theme.colors.grey;
  const timeStr = event.receivedAt.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={[styles.cardAccent, { backgroundColor: color }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: color + '22' }]}>
            <AppText style={[styles.badgeText, { color }]}>{event.eventName}</AppText>
          </View>
          <AppText style={styles.time}>{timeStr}</AppText>
        </View>
        <AppText style={styles.payload} numberOfLines={6}>
          {JSON.stringify(event.payload, null, 2)}
        </AppText>
      </View>
    </Animated.View>
  );
}

export function WsFeedbackScreen(): React.JSX.Element {
  const { socket, isConnected } = useSocket();
  const { goBack } = useNavigation();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<WsEvent[]>([]);
  const scrollRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!socket) return;

    const handlers: Array<{ name: string; fn: (payload: unknown) => void }> = [];

    for (const name of EVENT_NAMES) {
      const fn = (payload: unknown): void => {
        const newEvent: WsEvent = {
          id: `${Date.now().toString()}-${Math.random().toString()}`,
          eventName: name,
          payload,
          receivedAt: new Date(),
        };
        setEvents((prev) => [newEvent, ...prev].slice(0, 50));
      };
      socket.on(name, fn);
      handlers.push({ name, fn });
    }

    return (): void => {
      for (const { name, fn } of handlers) {
        socket.off(name, fn);
      }
    };
  }, [socket]);

  const clearEvents = (): void => {
    setEvents([]);
  };

  const renderItem = useCallback(({ item }: { item: WsEvent }) => <EventCard event={item} />, []);

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={[styles.cardHeader, { paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable
          onPress={() => {
            goBack();
          }}
          style={styles.badge}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppIcons icon="arrow-back" iconLibrary="Ionicons" size={24} color={theme.colors.black} />
        </Pressable>
        <AppText style={styles.badgeText}>WS Feedback</AppText>
        <View style={styles.backBtn} />
      </View>
      <View style={styles.statusBar}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              { backgroundColor: isConnected ? theme.colors.success : theme.colors.danger },
            ]}
          />
          <AppText
            style={[
              styles.statusText,
              { color: isConnected ? theme.colors.success : theme.colors.danger },
            ]}
          >
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </AppText>
        </View>
        {events.length > 0 && (
          <Pressable onPress={clearEvents} style={styles.clearBtn}>
            <AppText style={styles.clearBtnText}>Effacer</AppText>
          </Pressable>
        )}
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <AppText style={styles.emptyIcon}>📡</AppText>
          <AppText style={styles.emptyTitle}>En attente d'événements</AppText>
          <AppText style={styles.emptySubtitle}>
            Les événements WebSocket apparaîtront ici en temps réel
          </AppText>
          <AppText style={styles.emptyEvents}>
            Events écoutés :{'\n'}
            {EVENT_NAMES.join('\n')}
          </AppText>
        </View>
      ) : (
        <FlatList
          ref={scrollRef}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          data={events}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <AppText style={styles.count}>
              {events.length} événement{events.length > 1 ? 's' : ''} reçu
              {events.length > 1 ? 's' : ''}
            </AppText>
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.black,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  clearBtn: {
    backgroundColor: theme.colors.danger + '18',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  clearBtnText: {
    color: theme.colors.danger,
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  count: {
    fontSize: 13,
    color: theme.colors.grey,
    marginBottom: theme.spacing.sm,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  cardAccent: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: theme.colors.grey,
    fontWeight: '500',
  },
  payload: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
    lineHeight: 18,
    backgroundColor: '#f9fafb',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.black,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.colors.grey,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyEvents: {
    marginTop: theme.spacing.lg,
    fontSize: 12,
    color: theme.colors.grey,
    textAlign: 'center',
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    lineHeight: 20,
  },
});
