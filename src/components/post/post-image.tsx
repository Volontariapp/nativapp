import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { getFakeEcologyImage } from '@/utils/fake-images.util';

interface PostImageProps {
  postId: string;
  /** URL de l'image du post ; sans elle, une image de remplacement stable par post est affichée. */
  imageUrl: string | undefined;
}

export function PostImage({ postId, imageUrl }: PostImageProps): React.JSX.Element {
  const styles = useStyles(createStyles);
  const uri = imageUrl ?? getFakeEcologyImage(postId);

  return (
    <View style={styles.container}>
      <Image testID="post-image" source={{ uri }} style={styles.image} contentFit="cover" />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      paddingBottom: theme.spacing.lg,
    },
    image: {
      width: '100%',
      height: 300,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.lightGrey,
    },
  });
