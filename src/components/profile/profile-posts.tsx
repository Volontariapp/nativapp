import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { PostWeb } from '@volontariapp/contracts';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { PostGridTile } from '@/components/post/post-grid-tile';
import { PostDetailModal } from '@/components/post/post-detail-modal';
import { POST_GRID_GAP, usePostGridTileSize } from '@/components/post/post-grid.utils';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { ProfileSection } from './ProfileSection';

interface ProfilePostsProps {
  posts: PostWeb[];
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  /** Marge horizontale du parent, annulée pour que la grille aille jusqu'au bord de l'écran. */
  horizontalInset?: number;
}

/** Posts d'un utilisateur sur son profil : grille de carreaux, un appui ouvre le post. */
export function ProfilePosts({
  posts,
  isLoading,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  horizontalInset = 0,
}: ProfilePostsProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const tileSize = usePostGridTileSize();
  const [selectedPost, setSelectedPost] = React.useState<PostWeb | null>(null);

  return (
    <ProfileSection title="Posts">
      {isLoading ? (
        <ActivityIndicator color={theme.colors.primaryEco} />
      ) : posts.length > 0 ? (
        <View>
          <View style={[styles.grid, { marginHorizontal: -horizontalInset }]}>
            {posts.map((post) => (
              <PostGridTile key={post.id} post={post} size={tileSize} onPress={setSelectedPost} />
            ))}
          </View>
          {hasNextPage && (
            <View style={styles.seeMoreContainer}>
              <AppButton
                variant="eco"
                size="small"
                text={isFetchingNextPage ? 'Chargement...' : 'Voir plus'}
                onPress={fetchNextPage}
                disabled={isFetchingNextPage}
              />
            </View>
          )}
        </View>
      ) : (
        <AppText style={styles.emptyText}>Aucun post pour le moment.</AppText>
      )}

      <PostDetailModal
        visible={selectedPost !== null}
        post={selectedPost}
        onClose={() => {
          setSelectedPost(null);
        }}
      />
    </ProfileSection>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: POST_GRID_GAP,
      gap: POST_GRID_GAP,
    },
    seeMoreContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    emptyText: {
      color: theme.colors.grey,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
  });
