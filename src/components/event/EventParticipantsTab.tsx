import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';

import { SearchBar, FilterChip } from '@/components/ui';
import {
  ParticipantGauge,
  ParticipantCard,
  ParticipantEmptyState,
} from '@/components/event';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { EventParticipant, AppEvent } from '@/api/event/event.api';

type ParticipantFilter = 'ALL' | 'CONFIRMED' | 'PENDING';

export interface EventParticipantsTabProps {
  currentEvent?: AppEvent;
  participants: EventParticipant[];
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
  const [participantFilter, setParticipantFilter] = useState<ParticipantFilter>('ALL');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 250);
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const filteredParticipants = useMemo(() => {
    return rawParticipants.filter((p: EventParticipant) => {
      const matchesSearch =
        debouncedQuery.length === 0 ||
        p.pseudo.toLowerCase().includes(debouncedQuery) ||
        (p.email?.toLowerCase().includes(debouncedQuery) ?? false);

      const matchesFilter =
        participantFilter === 'ALL' ||
        (participantFilter === 'CONFIRMED' && p.status === 'CONFIRMED') ||
        (participantFilter === 'PENDING' && p.status === 'PENDING');

      return matchesSearch && matchesFilter;
    });
  }, [rawParticipants, debouncedQuery, participantFilter]);

  const keyExtractor = useCallback(
    (item: EventParticipant, index: number): string =>
      item.id || (item.userId ?? '') || String(index),
    [],
  );

  const handleRowPress = useCallback(
    (userId: string): void => {
      onParticipantPress(userId);
    },
    [onParticipantPress],
  );

  const renderItem = useCallback(
    ({ item }: { item: EventParticipant }): React.JSX.Element => (
      <ParticipantCard
        participant={item}
        onPress={() => {
          handleRowPress(item.id || (item.userId ?? ''));
        }}
      />
    ),
    [handleRowPress],
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefetching}
        onRefresh={onRefresh}
        colors={[theme.colors.primaryEco]}
      />
    ),
    [isRefetching, onRefresh, theme.colors.primaryEco],
  );

  const listEmptyComponent = useMemo(
    () =>
      isLoading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primaryEco}
          style={styles.listLoader}
        />
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

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher par nom ou email..."
          style={styles.searchBar}
        />

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <FilterChip
            label="Tous"
            selected={participantFilter === 'ALL'}
            color={theme.colors.primaryEco}
            onPress={() => {
              setParticipantFilter('ALL');
            }}
          />
          <FilterChip
            label="Confirmés"
            selected={participantFilter === 'CONFIRMED'}
            color={theme.colors.primaryEco}
            onPress={() => {
              setParticipantFilter('CONFIRMED');
            }}
          />
          <FilterChip
            label="En attente"
            selected={participantFilter === 'PENDING'}
            color={theme.colors.warning}
            onPress={() => {
              setParticipantFilter('PENDING');
            }}
          />
        </View>
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
    searchBar: {
      marginBottom: theme.spacing.sm,
    },
    filterRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
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
