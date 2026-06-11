import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Pressable,
  type GestureResponderEvent,
} from 'react-native';
import { AppText } from '@/components/typography/AppText';
import AppHeader from '@/components/layout/AppHeader';
import { AppButton } from '@/components/buttons/AppButton';
import { PostDetailModal } from '@/components/post/PostDetailModal';
import { theme } from '@/shared/themes/theme';
import { useGetMyPosts, useDeletePost } from '@/api/post/hooks';
import type { PostWeb } from '@volontariapp/contracts';

export function MyPostsScreen(): React.JSX.Element {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetMyPosts(10);
  const { mutateAsync: deletePost } = useDeletePost();
  const [selectedPost, setSelectedPost] = React.useState<PostWeb | null>(null);
  const [detailModalVisible, setDetailModalVisible] = React.useState(false);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      setDetailModalVisible(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Failed to delete post:', message);
      Alert.alert('Erreur', message);
    }
  };

  const handlePostPress = (post: PostWeb) => {
    setSelectedPost(post);
    setDetailModalVisible(true);
  };

  const renderItem = ({ item }: { item: PostWeb }) => (
    <Pressable
      style={styles.postCard}
      onPress={() => {
        handlePostPress(item);
      }}
    >
      <View style={styles.postHeader}>
        <AppText style={styles.postTitle}>{item.title}</AppText>
      </View>
      <AppText style={styles.postContent} numberOfLines={2}>
        {item.content}
      </AppText>
      <AppButton
        text="Supprimer"
        variant="secondary"
        onPress={(e?: GestureResponderEvent) => {
          e?.stopPropagation();
          void handleDelete(item.id);
        }}
        style={styles.deleteButton}
      />
    </Pressable>
  );

  return (
    <>
      <View style={styles.container}>
        <AppHeader />
        <AppText style={{ fontSize: 24, fontWeight: 'bold', margin: theme.spacing.md }}>
          Mes posts
        </AppText>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primaryEco} />
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
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

      {selectedPost && (
        <PostDetailModal
          visible={detailModalVisible}
          post={selectedPost}
          onClose={() => {
            setDetailModalVisible(false);
            setSelectedPost(null);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  postCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  postContent: {
    fontSize: 14,
    color: theme.colors.grey,
    marginBottom: theme.spacing.md,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    width: 120,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.grey,
    marginTop: theme.spacing.xxl,
  },
});
