import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

const UPLOADING_HINT = 'Envoi des images en cours...';
const BLOCKING_HINT = 'Retirez ou renvoyez les images en échec ou refusées avant de publier.';

interface PostPublishFooterProps {
  isBusy: boolean;
  isUploading: boolean;
  hasBlockingImage: boolean;
  onPublish: () => void;
}

export const isPublishBlocked = ({
  isBusy,
  isUploading,
  hasBlockingImage,
}: Omit<PostPublishFooterProps, 'onPublish'>): boolean => isBusy || isUploading || hasBlockingImage;

function PublishHints({
  isUploading,
  hasBlockingImage,
}: Pick<PostPublishFooterProps, 'isUploading' | 'hasBlockingImage'>): React.JSX.Element {
  const styles = useStyles(createStyles);

  return (
    <>
      {isUploading && <AppText style={styles.hint}>{UPLOADING_HINT}</AppText>}
      {hasBlockingImage && <AppText style={styles.hintError}>{BLOCKING_HINT}</AppText>}
    </>
  );
}

export function PostPublishFooter({
  isBusy,
  isUploading,
  hasBlockingImage,
  onPublish,
}: PostPublishFooterProps): React.JSX.Element {
  const styles = useStyles(createStyles);
  const blocked = isPublishBlocked({ isBusy, isUploading, hasBlockingImage });

  return (
    <View style={styles.container}>
      <PublishHints isUploading={isUploading} hasBlockingImage={hasBlockingImage} />
      <AppButton
        text={isBusy ? 'Publication...' : 'Publier le post'}
        variant="socio"
        onPress={blocked ? undefined : onPublish}
        disabled={blocked}
        style={styles.button}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing.xl,
      alignItems: 'center',
      width: '100%',
    },
    button: {
      width: '100%',
    },
    hint: {
      marginBottom: theme.spacing.sm,
      fontSize: 13,
      color: theme.colors.grey,
    },
    hintError: {
      marginBottom: theme.spacing.sm,
      fontSize: 13,
      color: theme.colors.danger,
    },
  });
