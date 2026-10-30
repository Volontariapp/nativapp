import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { MIN_ATTENDEES_FOR_ORGANIZER_POINTS } from '@volontariapp/shared';

import { SearchBar } from '@/components/ui';
import { ParticipantGauge, ParticipantCard, ParticipantEmptyState } from '@/components/event';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import { EventState, type UserWeb } from '@volontariapp/contracts';
import { normalizeEventState } from '@/shared/lib/event-mappers.utils';
import { useEventAttendees, useSetEventAttendance } from '@/api/social/hooks/use-event-attendance';

export interface EventParticipantsTabProps {
  currentEvent?: AppEvent;
  participants: UserWeb[];
  totalRegistered: number;
  isLoading: boolean;
  isRefetching: boolean;
  onRefresh: () => void;
  onParticipantPress: (userId: string) => void;
}

export function EventParticipantsTab({
  currentEvent,
  participants: rawParticipants,
  totalRegistered,
  isLoading,
  isRefetching,
  onRefresh,
  onParticipantPress,
}: EventParticipantsTabProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const eventId = currentEvent?.id;
  const normalizedState = currentEvent ? normalizeEventState(currentEvent.state) : null;
  const isInProgress = normalizedState === EventState.EVENT_STATE_IN_PROGRESS;
  const isFinished = normalizedState === EventState.EVENT_STATE_FINISHED;

  const { data: attendeesData, refetch: refetchAttendees } = useEventAttendees(eventId);

  const attendanceMutation = useSetEventAttendance(eventId);

  const checkedInUserIds = useMemo(() => {
    const set = new Set<string>();
    if (attendeesData?.attendees) {
      for (const a of attendeesData.attendees) {
        if (a.checkedInAt) {
          set.add(a.userId);
        }
      }
    }
    return set;
  }, [attendeesData]);

  const checkedInCount = checkedInUserIds.size;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 250);
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const filteredParticipants = useMemo(() => {
    if (debouncedQuery.length === 0) {
      return rawParticipants;
    }
    return rawParticipants.filter((p: UserWeb) => {
      const partial = p as Partial<UserWeb>;
      const pseudoMatch = partial.pseudo?.toLowerCase().includes(debouncedQuery) ?? false;
      const emailMatch = partial.email?.toLowerCase().includes(debouncedQuery) ?? false;
      return pseudoMatch || emailMatch;
    });
  }, [rawParticipants, debouncedQuery]);

  const keyExtractor = useCallback(
    (item: UserWeb, index: number): string => item.id || String(index),
    [],
  );

  const handleRowPress = useCallback(
    (userId: string): void => {
      onParticipantPress(userId);
    },
    [onParticipantPress],
  );

  const handleToggleCheckIn = useCallback(
    async (userId: string, currentStatus: boolean): Promise<void> => {
      setPendingUserId(userId);
      try {
        await attendanceMutation.mutateAsync({
          checkedUserIds: currentStatus ? [] : [userId],
          uncheckedUserIds: currentStatus ? [userId] : [],
        });
      } finally {
        setPendingUserId(null);
      }
    },
    [attendanceMutation],
  );

  const renderItem = useCallback(
    ({ item }: { item: UserWeb }): React.JSX.Element => {
      const isCheckedIn = checkedInUserIds.has(item.id);
      return (
        <ParticipantCard
          participant={item}
          isCheckedIn={isCheckedIn}
          canCheckIn={isInProgress}
          isCheckInPending={pendingUserId === item.id}
          onToggleCheckIn={() => {
            void handleToggleCheckIn(item.id, isCheckedIn);
          }}
          onPress={() => {
            handleRowPress(item.id);
          }}
        />
      );
    },
    [checkedInUserIds, isInProgress, pendingUserId, handleToggleCheckIn, handleRowPress],
  );

  const handleCombinedRefresh = useCallback(() => {
    onRefresh();
    if (eventId !== undefined && eventId.length > 0) {
      void refetchAttendees();
    }
  }, [onRefresh, eventId, refetchAttendees]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefetching}
        onRefresh={handleCombinedRefresh}
        colors={[theme.colors.primaryEco]}
      />
    ),
    [isRefetching, handleCombinedRefresh, theme.colors.primaryEco],
  );

  const listEmptyComponent = useMemo(
    () =>
      isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primaryEco} style={styles.listLoader} />
      ) : (
        <ParticipantEmptyState isSearchActive={debouncedQuery.length > 0} />
      ),
    [isLoading, debouncedQuery.length, theme.colors.primaryEco, styles.listLoader],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        {/* Gauge */}
        {currentEvent && (
          <ParticipantGauge
            current={totalRegistered}
            max={currentEvent.maxParticipants}
            style={styles.gauge}
          />
        )}

        {/* Live check-in banner */}
        {(isInProgress || isFinished) && (
          <View
            style={[
              styles.attendanceBanner,
              checkedInCount >= MIN_ATTENDEES_FOR_ORGANIZER_POINTS
                ? styles.attendanceBannerSuccess
                : styles.attendanceBannerWarning,
            ]}
          >
            <Feather
              name={checkedInCount >= MIN_ATTENDEES_FOR_ORGANIZER_POINTS ? 'award' : 'info'}
              size={18}
              color={
                checkedInCount >= MIN_ATTENDEES_FOR_ORGANIZER_POINTS
                  ? theme.colors.primaryEco
                  : theme.colors.goldText
              }
            />
            <View style={styles.attendanceBannerContent}>
              <AppText style={styles.attendanceBannerTitle}>
                {`${String(checkedInCount)} / ${String(rawParticipants.length)} participant${rawParticipants.length > 1 ? 's' : ''} émargé${checkedInCount > 1 ? 's' : ''}`}
              </AppText>
              <AppText style={styles.attendanceBannerSubtitle}>
                {checkedInCount >= MIN_ATTENDEES_FOR_ORGANIZER_POINTS
                  ? 'Prime créateur débloquée pour cet événement !'
                  : `Encore ${String(MIN_ATTENDEES_FOR_ORGANIZER_POINTS - checkedInCount)} présent(s) requis pour débloquer la prime créateur.`}
              </AppText>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher par nom ou email..."
          style={styles.searchBar}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredParticipants}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={refreshControl}
        ListEmptyComponent={listEmptyComponent}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerSection: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    gauge: {
      marginBottom: theme.spacing.md,
    },
    attendanceBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md,
    },
    attendanceBannerSuccess: {
      backgroundColor: '#f0fdf4',
      borderColor: theme.colors.primaryEco,
    },
    attendanceBannerWarning: {
      backgroundColor: theme.colors.goldBackground,
      borderColor: theme.colors.goldBorder,
    },
    attendanceBannerContent: {
      flex: 1,
    },
    attendanceBannerTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    attendanceBannerSubtitle: {
      fontSize: 11,
      color: theme.colors.grey,
    },
    searchBar: {
      marginBottom: theme.spacing.sm,
    },
    listContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl * 2,
    },
    listLoader: {
      marginVertical: theme.spacing.xxl,
    },
  });
