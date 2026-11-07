import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AppIcons } from '@/components/media/AppIcons';
import { LiveCandidateCard } from '@/components/event/live/LiveCandidateCard';
import { LiveFullEventsSection } from '@/components/event/live/LiveFullEventsSection';
import { LiveMyEventSection } from '@/components/event/live/LiveMyEventSection';
import { LiveRouteMap } from '@/components/event/live/LiveRouteMap';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { LiveEventCandidate, LiveScreenStatus } from '@/api/event/live-events.utils';
import { useLiveEventScreen } from './hooks/use-live-event-screen';

const STATUS_MESSAGES: Partial<Record<LiveScreenStatus, string>> = {
  locating: 'Localisation en cours...',
  searching: 'Recherche des événements en direct...',
  empty: 'Aucun événement en direct autour de vous',
  permission_denied:
    'Permission de localisation refusée. Activez-la dans les réglages pour trouver les événements autour de vous.',
  error: 'Impossible de charger les événements en direct.',
};

const keyExtractor = (candidate: LiveEventCandidate): string => candidate.event.id;

export function LiveEventScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();
  const {
    status,
    position,
    result,
    myEvents,
    participatingEventId,
    selectedRoute,
    handleParticipate,
    handleSelectRoute,
    handleClearRoute,
    handleRetry,
    handleOpenDetail,
    handleOpenMyEvents,
    handleBack,
  } = useLiveEventScreen();

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<LiveEventCandidate>) => (
      <LiveCandidateCard
        candidate={item}
        rank={index + 1}
        isParticipating={participatingEventId === item.event.id}
        onParticipate={(candidate) => {
          handleParticipate(candidate.event);
        }}
        onSelect={(candidate) => {
          handleSelectRoute(candidate.event);
        }}
      />
    ),
    [participatingEventId, handleParticipate, handleSelectRoute],
  );

  const statusMessage = STATUS_MESSAGES[status];
  const isBusy = status === 'locating' || status === 'searching';
  const hasRoute =
    selectedRoute !== null && position !== null && selectedRoute.event.location !== undefined;

  const header = (
    <View>
      <LiveMyEventSection
        items={myEvents}
        onShowRoute={handleSelectRoute}
        onOpenDetail={handleOpenDetail}
        onOpenMyEvents={handleOpenMyEvents}
      />
      {hasRoute && selectedRoute.event.location !== undefined && (
        <LiveRouteMap
          title={selectedRoute.event.title}
          origin={position}
          destination={selectedRoute.event.location}
          route={selectedRoute.route}
          isLoading={selectedRoute.isLoading}
          isError={selectedRoute.isError}
          onClose={handleClearRoute}
        />
      )}
      <AppText style={styles.sectionHeading}>AUTOUR DE MOI (2 km à pied)</AppText>
      {statusMessage !== undefined && (
        <View style={styles.statusBlock} testID={`live-status-${status}`}>
          {isBusy && <ActivityIndicator size="small" color={theme.colors.primaryEco} />}
          <AppText style={styles.statusText}>{statusMessage}</AppText>
          {status === 'error' && (
            <AppButton
              text="Réessayer"
              size="small"
              variant="eco"
              testID="live-retry"
              onPress={handleRetry}
            />
          )}
        </View>
      )}
      {status === 'ready' && result.joinable.length === 0 && (
        <AppText style={styles.statusText}>Aucun événement joignable pour le moment.</AppText>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="live-event-screen">
      <View style={styles.topBar}>
        <Pressable
          onPress={handleBack}
          hitSlop={theme.spacing.md}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          testID="live-back"
        >
          <AppIcons icon="arrow-left" size={24} color={theme.colors.text} />
        </Pressable>
        <AppText style={styles.topBarTitle}>Événements en direct</AppText>
      </View>
      <FlatList
        data={status === 'ready' ? result.joinable : []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListFooterComponent={
          status === 'ready' ? <LiveFullEventsSection candidates={result.full} /> : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    topBarTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    listContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    sectionHeading: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.grey,
      letterSpacing: 1,
      marginBottom: theme.spacing.sm,
    },
    statusBlock: {
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.xl,
    },
    statusText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.grey,
      textAlign: 'center',
    },
  });
