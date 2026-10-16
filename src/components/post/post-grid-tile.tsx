import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import type { PostMediaStatusWeb, PostWeb } from '@volontariapp/contracts';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { resolvePostImageUrl } from '@/api/post/resolve-post-image-url';
import { getFakeEcologyImage } from '@/utils/fake-images.util';

const STATUS_BADGES: Record<PostMediaStatusWeb, string | undefined> = {
  NONE: undefined,
  READY: undefined,
  PENDING: 'En traitement',
  REJECTED: 'Image refusée',
};

interface PostGridTileProps {
  post: PostWeb;
  onPress: (post: PostWeb) => void;
}

/** Carreau carré d'un post dans une grille : son image, ou une image de remplacement stable. */
export function PostGridTile({ post, onPress }: PostGridTileProps): React.JSX.Element {
  const styles = useStyles(createStyles);
  const uri = resolvePostImageUrl(post) ?? getFakeEcologyImage(post.id);
  const badge = STATUS_BADGES[post.mediaStatus ?? 'NONE'];

  return (
    <Pressable
      style={styles.tile}
      accessibilityLabel={`Ouvrir le post ${post.title}`}
      onPress={() => {
        onPress(post);
      }}
    >
      <Image
        testID="post-grid-tile-image"
        source={{ uri }}
        style={styles.image}
        contentFit="cover"
      />
      {badge !== undefined && (
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>{badge}</AppText>
        </View>
      )}
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    tile: {
      width: '33.3333%',
      aspectRatio: 1,
      padding: 1,
    },
    image: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.lightGrey,
    },
    badge: {
      position: 'absolute',
      left: theme.spacing.xs,
      bottom: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.background,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.text,
    },
  });
