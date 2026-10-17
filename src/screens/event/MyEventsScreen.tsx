import React, { useCallback, useEffect, useMemo } from 'react';
import type { SectionListRenderItemInfo } from 'react-native';
import { View, StyleSheet, SectionList, ActivityIndicator } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import AppHeader from '@/components/layout/AppHeader';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useGetMyEvents } from '@/api/event/hooks/use-get-my-events';
import type { AppEvent } from '@/api/event/event.api';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import { groupEventsByType, type EventGroup } from '@/api/event/group-events';
import { MyEventItem } from '@/components/event/my-event-item';

export function MyEventsScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const rootNavigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const { data, isLoading, isError, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetMyEvents(10);

  const sections = useMemo(
    () => groupEventsByType(data?.pages.flatMap((page) => page.events) ?? []),
    [data],
  );

  const handleEventPress = useCallback(
    (event: AppEvent) => {
      rootNavigation.navigate('EventDetail', { event });
    },
    [rootNavigation],
  );

  const handleEventEdit = useCallback(
    (event: AppEvent) => {
      rootNavigation.navigate('EventManagement', { eventId: event.id, initialEvent: event });
    },
    [rootNavigation],
  );

  const renderItem = useCallback(
    ({ item }: SectionListRenderItemInfo<AppEvent, EventGroup>) => (
      <MyEventItem
        event={item}
        onPress={() => {
          handleEventPress(item);
        }}
        onEdit={() => {
          handleEventEdit(item);
        }}
      />
    ),
    [handleEventPress, handleEventEdit],
  );

  const keyExtractor = useCallback((item: AppEvent) => item.id, []);

  useEffect(() => {
    if (isError) {
      console.error(
        '[MyEventsScreen] Details erreur :',
        error instanceof Error ? error.message : String(error),
      );
    }
  }, [isError, error]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <View style={styles.container}>
      <AppHeader showBack />
      <AppText style={styles.pageTitle}>Mes événements</AppText>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primaryEco} style={styles.loader} />
      ) : isError ? (
        <AppText style={styles.errorText}>Erreur lors du chargement de vos événements.</AppText>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <AppText style={styles.sectionTitle}>
              {section.title} ({String(section.data.length)})
            </AppText>
          )}
          stickySectionHeadersEnabled={false}
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    pageTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginHorizontal: theme.spacing.xl,
      marginVertical: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
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
