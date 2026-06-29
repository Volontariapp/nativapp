import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { getFakeEcologyImage } from '@/utils/fake-images.util';

interface PostImagePlaceholderProps {
  postId: string;
}

export function PostImagePlaceholder({ postId }: PostImagePlaceholderProps) {
  const imageUrl = getFakeEcologyImage(postId);

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
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
