import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { AvatarUpload } from '@/api/user/hooks/use-avatar-upload';

interface AvatarUploadSectionProps {
  upload: AvatarUpload;
  /** Avatar actuel, affiché tant qu'aucune nouvelle photo n'est prête. */
  currentAvatarUrl: string | undefined;
  disabled?: boolean;
}

export const AvatarUploadSection = ({
  upload,
  currentAvatarUrl,
  disabled = false,
}: AvatarUploadSectionProps): React.JSX.Element => {
  const styles = useStyles(createStyles);
  const previewUri = upload.previewUri ?? currentAvatarUrl;

  return (
    <View style={styles.container}>
      <AppText style={styles.label}>Photo de profil</AppText>
      {previewUri !== undefined && previewUri !== '' && (
        <Image
          testID="avatar-preview"
          source={{ uri: previewUri }}
          style={styles.preview}
          contentFit="cover"
        />
      )}
      <AppButton
        testID="choose-avatar-button"
        text={upload.isUploading ? 'Envoi de la photo...' : 'Choisir une image'}
        variant="eco"
        icon="image"
        loading={upload.isUploading}
        disabled={disabled}
        onPress={() => {
          void upload.choosePhoto();
        }}
      />
      {upload.message !== undefined && <AppText style={styles.error}>{upload.message}</AppText>}
      {upload.canRetry && <AppButton text="Réessayer" variant="socio" onPress={upload.retry} />}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    preview: {
      width: 96,
      height: 96,
      borderRadius: theme.radius.full,
      alignSelf: 'center',
    },
    error: {
      color: theme.colors.danger,
    },
  });
