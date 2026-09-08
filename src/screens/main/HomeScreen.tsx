import { StyleSheet, View, ActivityIndicator } from 'react-native';

import React, { useCallback, useMemo, useRef } from 'react';
import { AppText } from '@/components/typography/AppText';
import AppHeader from '@/components/layout/AppHeader';
import { theme } from '@/shared/themes/theme';
import { useListPosts } from '@/api/post/hooks/use-list-all-posts';
import AppPost from '@/components/post/AppPost';
import Animated from 'react-native-reanimated';
import { useScrollTabBar } from '@/navigation/hooks/useScrollTabBar';

export function HomeScreen(): React.JSX.Element {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useListPosts({
      limit: 10,
    });

  const scrollHandler = useScrollTabBar();
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
    void refreshCount;

    const randomizedPages =
      data?.pages.map((page) => {
        const pagePosts = [...page.posts];
        pagePosts.forEach((post) => {
          randomSortMap.current[post.id] ??= Math.random();
        });
        return pagePosts.sort(
          (a, b) => (randomSortMap.current[a.id] ?? 0) - (randomSortMap.current[b.id] ?? 0),
        );
      }) ?? [];

    const finalPosts = randomizedPages.flat();
    console.log('[HomeScreen] Total posts rendered:', finalPosts.length);
    return finalPosts;
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
          <Animated.FlatList
            data={posts}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            onRefresh={() => {
              void handleRefresh();
            }}
            refreshing={isRefreshing}
            onEndReached={() => {
              console.log(
                '[HomeScreen] onEndReached triggered. hasNextPage:',
                hasNextPage,
                'isFetchingNextPage:',
                isFetchingNextPage,
              );
              if (hasNextPage && !isFetchingNextPage) {
                console.log('[HomeScreen] Calling fetchNextPage()...');
                void fetchNextPage();
              } else if (!hasNextPage) {
                console.log('[HomeScreen] No more pages available (hasNextPage is false).');
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              <View style={styles.footerLoader}>
                {isFetchingNextPage ? (
                  <ActivityIndicator size="small" color={theme.colors.primarySocio} />
                ) : hasNextPage ? (
                  <AppText
                    style={{
                      padding: 20,
                      color: theme.colors.primarySocio,
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                    onPress={() => {
                      console.log('[HomeScreen] Manual load more clicked!');
                      void fetchNextPage();
                    }}
                  >
                    Charger plus de posts
                  </AppText>
                ) : (
                  <AppText style={{ padding: 20, color: theme.colors.grey, textAlign: 'center' }}>
                    Fin des posts
                  </AppText>
                )}
              </View>
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
