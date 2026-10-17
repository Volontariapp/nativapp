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
  rejected: 'Photo refusée',
  failed: 'Échec de l’envoi',
};

interface EventCoverPickerProps {
  cover: PostImage | undefined;
  onAdd: () => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

export function EventCoverPicker({
  cover,
  onAdd,
  onRetry,
  onRemove,
}: EventCoverPickerProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  if (cover === undefined) {
    return (
      <Pressable style={styles.placeholder} accessibilityLabel="Ajouter une photo" onPress={onAdd}>
        <Feather name="plus" size={32} color={theme.colors.grey} />
        <AppText style={styles.placeholderText}>Ajouter une photo</AppText>
      </Pressable>
    );
  }

  const label = STATUS_LABELS[cover.status];
  const isProblem = cover.status === 'rejected' || cover.status === 'failed';

  return (
    <View style={styles.container}>
      <Image source={{ uri: cover.source.uri }} style={styles.preview} contentFit="cover" />
      <Pressable
        style={styles.removeButton}
        accessibilityLabel="Retirer la photo"
        onPress={() => {
          onRemove(cover.id);
        }}
      >
        <Feather name="x" size={16} color={theme.colors.text} />
      </Pressable>
      {label !== undefined && (
        <View style={styles.statusRow}>
          <AppText style={[styles.status, isProblem && styles.statusProblem]}>{label}</AppText>
          {cover.status === 'failed' && (
            <Pressable
              accessibilityLabel="Renvoyer la photo"
              onPress={() => {
                onRetry(cover.id);
              }}
            >
              <AppText style={styles.retry}>Réessayer</AppText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: theme.spacing.xl,
    },
    preview: {
      width: '100%',
      height: 180,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.lightGrey,
    },
    removeButton: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xs,
    },
    status: {
      fontSize: 13,
      color: theme.colors.grey,
    },
    statusProblem: {
      color: theme.colors.danger,
    },
    retry: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.primarySocio,
    },
    placeholder: {
      width: '100%',
      height: 180,
      borderRadius: theme.radius.md,
      borderWidth: 2,
      borderColor: theme.colors.lightGrey,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      marginBottom: theme.spacing.xl,
    },
    placeholderText: {
      marginTop: theme.spacing.sm,
      color: theme.colors.grey,
      fontSize: 14,
      fontWeight: '500',
    },
  });
