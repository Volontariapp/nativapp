import React from 'react';
import { ActivityIndicator, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { PostWeb } from '@volontariapp/contracts';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import { PostGridTile } from '@/components/post/post-grid-tile';
import { PostDetailModal } from '@/components/post/post-detail-modal';
import { POST_GRID_GAP, computePostGridTileSize } from '@/components/post/post-grid.utils';
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
  /**
   * Marge horizontale du parent à conserver : la grille reste alignée avec le texte des sections
   * (au lieu d'aller jusqu'au bord) et les carreaux sont calculés sur la largeur restante.
   */
  contentInset?: number;
  /** Quand il est fourni, un bouton rond de création de post est affiché sur la ligne du titre. */
  onCreatePress?: () => void;
}

/** Posts d'un utilisateur sur son profil : grille de carreaux, un appui ouvre le post. */
export function ProfilePosts({
  posts,
  isLoading,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  horizontalInset = 0,
  contentInset = 0,
  onCreatePress,
}: ProfilePostsProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { width } = useWindowDimensions();
  const tileSize = computePostGridTileSize(width - contentInset * 2);
  const [selectedPost, setSelectedPost] = React.useState<PostWeb | null>(null);

  return (
    <ProfileSection
      title="Posts"
      action={
        onCreatePress !== undefined && (
          <AppIconsButton
            icon="plus"
            variant="eco"
            size={36}
            accessibilityRole="button"
            accessibilityLabel="Créer un post"
            onPress={onCreatePress}
          />
        )
      }
    >
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
