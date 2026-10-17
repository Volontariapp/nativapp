import React, { useCallback } from 'react';
import { View, ActivityIndicator, FlatList } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { AppText } from '@/components/typography/AppText';
import type { AppEvent } from '@/api/event/event.api';
import { EventItemCard } from './event-item-card';
import { createEventPickerStyles } from './event-picker-modal.styles';

interface EventPickerListProps {
  events: AppEvent[];
  isLoading: boolean;
  isSearching: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  selectedEventId?: string;
  onSelect: (event: AppEvent) => void;
  onPreview: (event: AppEvent) => void;
}

const keyExtractor = (item: AppEvent): string => item.id;

const EmptyState = ({ isSearching }: { isSearching: boolean }): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createEventPickerStyles);

  return (
    <View style={styles.emptyContainer}>
      <Feather name="calendar" size={40} color={theme.colors.grey} />
      <AppText style={styles.emptyTitle}>
        {isSearching ? 'Aucun résultat trouvé' : 'Aucun événement disponible'}
      </AppText>
      <AppText style={styles.emptySubtitle}>
        {isSearching
          ? 'Essayez de modifier vos termes de recherche'
          : "Il n'y a pas encore d'événement à associer."}
      </AppText>
    </View>
  );
};

export function EventPickerList({
  events,
  isLoading,
  isSearching,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  selectedEventId,
  onSelect,
  onPreview,
}: EventPickerListProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createEventPickerStyles);

  const renderItem = useCallback(
    ({ item }: { item: AppEvent }) => (
      <EventItemCard
        event={item}
        isSelected={selectedEventId === item.id}
        onSelect={onSelect}
        onPreview={onPreview}
      />
    ),
    [selectedEventId, onSelect, onPreview],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primaryEco} />
        <AppText style={styles.loadingText}>Chargement des événements...</AppText>
      </View>
    );
  }

  if (events.length === 0) return <EmptyState isSearching={isSearching} />;

  return (
    <FlatList
      data={events}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      style={styles.modalList}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator style={styles.footerLoader} color={theme.colors.primaryEco} />
        ) : null
      }
    />
  );
}
