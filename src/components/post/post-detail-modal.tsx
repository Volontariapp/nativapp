import React from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type { PostWeb } from '@volontariapp/contracts';
import { AppButton } from '@/components/buttons/AppButton';
import AppPost from '@/components/post/AppPost';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface PostDetailModalProps {
  visible: boolean;
  post: PostWeb | null;
  onClose: () => void;
  /** Fourni pour mes propres posts : affiche le bouton de suppression. */
  onDelete?: (id: string) => void;
}

/** Vue d'un post : image, description, likes et commentaires (carte du fil), suppression si permise. */
export function PostDetailModal({
  visible,
  post,
  onClose,
  onDelete,
}: PostDetailModalProps): React.JSX.Element | null {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  if (post === null) {
    return null;
  }

  const confirmDelete = (): void => {
    Alert.alert('Supprimer ce post ?', 'Cette action est définitive.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          onDelete?.(post.id);
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Fermer la vue"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Feather name="x" size={24} color={theme.colors.text} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <AppPost post={post} />
            <View style={styles.actions}>
              {onDelete !== undefined && (
                <AppButton text="Supprimer" variant="danger" onPress={confirmDelete} />
              )}
              <AppButton text="Fermer" variant="secondary" onPress={onClose} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    closeButton: {
      padding: theme.spacing.sm,
    },
    actions: {
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
  });
