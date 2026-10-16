import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { PostImage, PostImageStatus } from '@/api/post/post-images.types';

const STATUS_LABELS: Record<PostImageStatus, string | undefined> = {
  uploading: 'Envoi...',
  ready: undefined,
  processing: 'Analyse en cours',
  rejected: 'Refusée',
  failed: 'Échec',
};

interface PostImagesPickerProps {
  images: PostImage[];
  remainingSlots: number;
  onAdd: () => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

export function PostImagesPicker({
  images,
  remainingSlots,
  onAdd,
  onRetry,
  onRemove,
}: PostImagesPickerProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const maxImages = images.length + remainingSlots;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {images.map((image, index) => {
          const label = STATUS_LABELS[image.status];
          const isProblem = image.status === 'rejected' || image.status === 'failed';
          return (
            <View key={image.id} style={styles.tile}>
              <Image
                source={{ uri: image.source.uri }}
                style={styles.thumbnail}
                contentFit="cover"
              />
              <Pressable
                style={styles.removeButton}
                accessibilityLabel={`Retirer l'image ${String(index + 1)}`}
                onPress={() => {
                  onRemove(image.id);
                }}
              >
                <Feather name="x" size={14} color={theme.colors.text} />
              </Pressable>
              {label !== undefined && (
                <AppText style={[styles.status, isProblem && styles.statusProblem]}>
                  {label}
                </AppText>
              )}
              {image.status === 'failed' && (
                <Pressable
                  accessibilityLabel={`Renvoyer l'image ${String(index + 1)}`}
                  onPress={() => {
                    onRetry(image.id);
                  }}
                >
                  <AppText style={styles.retry}>Réessayer</AppText>
                </Pressable>
              )}
            </View>
          );
        })}
        {remainingSlots > 0 && (
          <Pressable style={styles.addTile} accessibilityLabel="Ajouter une image" onPress={onAdd}>
            <Feather name="plus" size={28} color={theme.colors.grey} />
            <AppText style={styles.addText}>
              {maxImages > 1
                ? `Ajouter une image (${String(images.length)}/${String(maxImages)})`
                : 'Ajouter une image'}
            </AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const TILE_SIZE = 96;

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xl,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    tile: {
      width: TILE_SIZE,
    },
    thumbnail: {
      width: TILE_SIZE,
      height: TILE_SIZE,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.lightGrey,
    },
    removeButton: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    status: {
      marginTop: theme.spacing.xs,
      fontSize: 12,
      color: theme.colors.grey,
    },
    statusProblem: {
      color: theme.colors.danger,
    },
    retry: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primarySocio,
    },
    addTile: {
      width: TILE_SIZE,
      height: TILE_SIZE,
      borderRadius: theme.radius.md,
      borderWidth: 2,
      borderColor: theme.colors.lightGrey,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.white,
      padding: theme.spacing.xs,
    },
    addText: {
      marginTop: theme.spacing.xs,
      textAlign: 'center',
      fontSize: 11,
      color: theme.colors.grey,
    },
  });
