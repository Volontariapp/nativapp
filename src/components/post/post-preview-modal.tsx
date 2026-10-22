import React from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import AppHeader from '@/components/layout/AppHeader';
import { PostAuthorHeader } from './PostAuthorHeader';
import { PostImage } from './post-image';

const PREVIEW_POST_ID = 'post-preview';

interface PostPreviewModalProps {
  visible: boolean;
  pseudo: string | undefined;
  avatarUrl: string | undefined;
  title: string;
  content: string;
  imageUri: string | undefined;
  eventTitle: string | undefined;
  isPublishing: boolean;
  onEdit: () => void;
  onConfirm: () => void;
}

function PreviewEventLink({ title }: { title: string | undefined }): React.JSX.Element | null {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  if (title === undefined) return null;

  return (
    <View style={styles.eventLink}>
      <Feather name="search" size={14} color={theme.colors.primarySocio} />
      <AppText style={styles.eventText}>{title}</AppText>
    </View>
  );
}

/** Apercu du post tel qu'il apparaitra dans le feed, avant publication. */
export function PostPreviewModal({
  visible,
  pseudo,
  avatarUrl,
  title,
  content,
  imageUri,
  eventTitle,
  isPublishing,
  onEdit,
  onConfirm,
}: PostPreviewModalProps): React.JSX.Element {
  const styles = useStyles(createStyles);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onEdit}>
      <View style={styles.container}>
        <AppHeader />
        <AppText style={styles.heading}>Aperçu de ton post</AppText>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <PostAuthorHeader pseudo={pseudo} avatarUrl={avatarUrl} />
          {imageUri !== undefined && <PostImage postId={PREVIEW_POST_ID} imageUrl={imageUri} />}
          <AppText style={styles.title}>{title}</AppText>
          <AppText style={styles.description}>
            <AppText style={styles.authorPseudo}>{`${pseudo ?? ''} `}</AppText>
            {content}
          </AppText>
          <PreviewEventLink title={eventTitle} />
        </ScrollView>
        <View style={styles.footer}>
          <AppButton text="Modifier" variant="secondary" onPress={onEdit} disabled={isPublishing} />
          <AppButton
            text={isPublishing ? 'Publication...' : 'Confirmer et publier'}
            variant="socio"
            onPress={onConfirm}
            disabled={isPublishing}
          />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    heading: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      textAlign: 'center',
      marginVertical: theme.spacing.md,
    },
    scrollContent: {
      paddingBottom: theme.spacing.lg,
    },
    title: {
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    description: {
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.sm,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: 20,
      color: theme.colors.text,
    },
    authorPseudo: {
      fontWeight: theme.typography.fontWeight.bold,
    },
    eventLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    eventText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.primarySocio,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    footer: {
      gap: theme.spacing.sm,
      padding: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.lightGrey,
    },
  });
