import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import AppHeader from '@/components/layout/AppHeader';
import { PostGridTile } from '@/components/post/post-grid-tile';
import { PostDetailModal } from '@/components/post/post-detail-modal';
import {
  POST_GRID_COLUMNS,
  POST_GRID_GAP,
  usePostGridTileSize,
} from '@/components/post/post-grid.utils';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useGetMyPosts, useDeletePost } from '@/api/post/hooks';
import type { PostWeb } from '@volontariapp/contracts';
import { useTabBarContentInset } from '@/navigation/hooks/useTabBarContentInset';

const PAGE_SIZE = POST_GRID_COLUMNS * 4;

export function MyPostsScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const tabBarInset = useTabBarContentInset();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetMyPosts(PAGE_SIZE);
  const { mutateAsync: deletePost } = useDeletePost();
  const tileSize = usePostGridTileSize();
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
            numColumns={POST_GRID_COLUMNS}
            contentContainerStyle={[styles.gridContent, tabBarInset]}
            columnWrapperStyle={styles.gridRow}
            ItemSeparatorComponent={RowSeparator}
            renderItem={({ item }) => (
              <PostGridTile post={item} size={tileSize} onPress={setSelectedPost} />
            )}
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

      <PostDetailModal
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

function RowSeparator(): React.JSX.Element {
  const styles = useStyles(createStyles);
  return <View style={styles.rowSeparator} />;
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
    gridContent: {
      padding: POST_GRID_GAP,
    },
    gridRow: {
      gap: POST_GRID_GAP,
    },
    rowSeparator: {
      height: POST_GRID_GAP,
    },
    emptyText: {
      textAlign: 'center',
      color: theme.colors.grey,
      marginTop: theme.spacing.xxl,
    },
  });
