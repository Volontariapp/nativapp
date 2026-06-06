import React from 'react';
import type { ListRenderItemInfo } from 'react-native';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import AppHeader from '@/components/layout/AppHeader';
import { theme } from '@/shared/themes/theme';
import { useGetMyEvents } from '@/api/event/hooks/use-get-my-events';
import type { AppEvent } from '@/api/event/event.api';
import { EventCard } from '@/components/dataDisplay/EventCard';

const renderItem = ({ item }: ListRenderItemInfo<AppEvent>) => <EventCard event={item} />;

export function MyEventsScreen(): React.JSX.Element {
  const { data, isLoading, isError, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetMyEvents(10);

  const events = data?.pages.flatMap((page) => page.events) ?? [];

  React.useEffect(() => {
    console.log(
      `[MyEventsScreen] State updated. isLoading: ${String(isLoading)}, isError: ${String(isError)}, events loaded: ${String(events.length)}`,
    );
    if (isError) {
      console.error('[MyEventsScreen] Details erreur :', error);
    }
  }, [isLoading, isError, error, events.length]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader showBack />
      <AppText style={styles.pageTitle}>Mes événements</AppText>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primaryEco} style={styles.loader} />
      ) : isError ? (
        <AppText style={styles.errorText}>Erreur lors du chargement de vos événements.</AppText>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={<AppText style={styles.emptyText}>Aucun événement trouvé.</AppText>}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={theme.colors.primaryEco} style={styles.footerLoader} />
            ) : null
          }
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
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginHorizontal: theme.spacing.xl,
    marginVertical: theme.spacing.md,
  },
  listContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
  footerLoader: {
    marginVertical: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.grey,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
