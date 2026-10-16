import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';

import { SearchBar } from '@/components/ui';
import {
  ParticipantGauge,
  ParticipantCard,
  ParticipantEmptyState,
} from '@/components/event';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import type { UserWeb } from '@volontariapp/contracts';

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
    (item: UserWeb, index: number): string =>
      item.id || String(index),
    [],
  );

  const handleRowPress = useCallback(
    (userId: string): void => {
      onParticipantPress(userId);
    },
    [onParticipantPress],
  );

  const renderItem = useCallback(
    ({ item }: { item: UserWeb }): React.JSX.Element => (
      <ParticipantCard
        participant={item}
        onPress={() => {
          handleRowPress(item.id);
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
    listContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl * 2,
    },
    listLoader: {
      marginVertical: theme.spacing.xxl,
    },
  });

