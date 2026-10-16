import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import AppHeader from '@/components/layout/AppHeader';
import { PostGridTile } from '@/components/post/post-grid-tile';
import { MyPostDetailModal } from '@/components/post/my-post-detail-modal';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useGetMyPosts, useDeletePost } from '@/api/post/hooks';
import type { PostWeb } from '@volontariapp/contracts';

const GRID_COLUMNS = 3;
const PAGE_SIZE = GRID_COLUMNS * 4;

export function MyPostsScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetMyPosts(PAGE_SIZE);
  const { mutateAsync: deletePost } = useDeletePost();
  const [selectedPost, setSelectedPost] = React.useState<PostWeb | null>(null);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      setSelectedPost(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Failed to delete post:', message);
      Alert.alert('Erreur', message);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <AppHeader />
        <AppText style={styles.title}>Mes posts</AppText>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primaryEco} />
          </View>
        ) : (
          <FlatList
            testID="my-posts-grid"
            data={posts}
            keyExtractor={(item) => item.id}
            numColumns={GRID_COLUMNS}
            renderItem={({ item }) => <PostGridTile post={item} onPress={setSelectedPost} />}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                void fetchNextPage();
              }
            }}
            ListEmptyComponent={
              <AppText style={styles.emptyText}>
                Vous n'avez créé aucun post pour le moment.
              </AppText>
            }
          />
        )}
      </View>

      <MyPostDetailModal
        visible={selectedPost !== null}
        post={selectedPost}
        onClose={() => {
          setSelectedPost(null);
        }}
        onDelete={(id) => {
          void handleDelete(id);
        }}
      />
    </>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      margin: theme.spacing.md,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      textAlign: 'center',
      color: theme.colors.grey,
      marginTop: theme.spacing.xxl,
    },
  });
