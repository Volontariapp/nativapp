import { StyleSheet, FlatList, View, ActivityIndicator } from 'react-native';

import React, { useCallback, useMemo, useRef } from 'react';
import { AppText } from '@/components/typography/AppText';
import AppHeader from '@/components/layout/AppHeader';
import { theme } from '@/shared/themes/theme';
import { useListPosts } from '@/api/post/hooks/use-list-all-posts';
import AppPost from '@/components/post/AppPost';

export function HomeScreen(): React.JSX.Element {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useListPosts({
      limit: 10,
    });

  const randomSortMap = useRef<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [refreshCount, setRefreshCount] = React.useState(0);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    randomSortMap.current = {};
    await refetch();
    setRefreshCount((c) => c + 1);
    setIsRefreshing(false);
  }, [refetch]);

  const posts = useMemo(() => {
    const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];
    allPosts.forEach((post) => {
      randomSortMap.current[post.id] ??= Math.random();
    });
    return [...allPosts].sort((a, b) => randomSortMap.current[a.id] - randomSortMap.current[b.id]);
  }, [data, refreshCount]);

  type PostItem = React.ComponentProps<typeof AppPost>['post'];

  const keyExtractor = useCallback((item: PostItem) => item.id, []);

  const renderItem = useCallback(({ item }: { item: PostItem }) => <AppPost post={item} />, []);

  return (
    <View style={styles.container}>
      <AppHeader showSettings />
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primarySocio} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <AppText>Une erreur est survenue lors du chargement des posts.</AppText>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={() => {
              void handleRefresh();
            }}
            refreshing={isRefreshing}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                void fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={theme.colors.primarySocio} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.center}>
                <AppText>Aucun post à afficher pour le moment.</AppText>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    height: 12,
  },
});
