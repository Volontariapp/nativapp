import React from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type { PostWeb } from '@volontariapp/contracts';
import { AppButton } from '@/components/buttons/AppButton';
import AppPost from '@/components/post/AppPost';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface MyPostDetailModalProps {
  visible: boolean;
  post: PostWeb | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

/** Vue d'un de mes posts : image, description, likes et commentaires (carte du fil), suppression. */
export function MyPostDetailModal({
  visible,
  post,
  onClose,
  onDelete,
}: MyPostDetailModalProps): React.JSX.Element | null {
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
          onDelete(post.id);
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Fermer" onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={theme.colors.text} />
          </Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppPost post={post} />
          <View style={styles.actions}>
            <AppButton text="Supprimer" variant="danger" onPress={confirmDelete} />
          </View>
        </ScrollView>
      </SafeAreaView>
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
    },
  });
