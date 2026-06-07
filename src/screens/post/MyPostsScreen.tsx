import React from 'react';
import type { ListRenderItemInfo } from 'react-native';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import AppHeader from '@/components/layout/AppHeader';
import { theme } from '@/shared/themes/theme';
import { useGetMyPosts } from '@/api/post/hooks/use-get-my-posts';
import { useGetPost } from '@/api/post/hooks/use-get-post';
import AppPost from '@/components/post/AppPost';

// Un petit composant wrapper pour charger les détails d'un post à partir de son ID
const MyPostItem = ({ postId }: { postId: string }) => {
  const { data: post, isLoading } = useGetPost(postId);

  if (isLoading) return <ActivityIndicator style={{ marginVertical: 10 }} />;
  if (!post) return null;

  return <AppPost post={post} />;
};

const renderItem = ({ item }: ListRenderItemInfo<string>) => <MyPostItem postId={item} />;

export function MyPostsScreen(): React.JSX.Element {
  const { data, isLoading, isError, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetMyPosts(10);

  const postIds = data?.pages.flatMap((page) => page.postIds) ?? [];

  React.useEffect(() => {
    if (isError) {
      console.error('[MyPostsScreen] Details erreur :', error);
    }
  }, [isError, error]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader showBack />
      <AppText style={styles.pageTitle}>Mes posts</AppText>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : isError ? (
        <AppText style={styles.errorText}>Erreur lors du chargement de vos posts.</AppText>
      ) : (
        <FlatList
          data={postIds}
          keyExtractor={(item) => item}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={<AppText style={styles.emptyText}>Aucun post trouvé.</AppText>}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={theme.colors.primary} style={styles.footerLoader} />
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
