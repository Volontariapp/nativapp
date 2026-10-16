import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { EntityType } from '@volontariapp/contracts';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useFileUpload } from '@/api/storage/hooks/use-file-upload';
import type { DebugFile } from '../storage-debug.types';

interface StorageDebugUploadHookProps {
  file: DebugFile | null;
  entityType: EntityType;
}

/** Essaie le hook de production : redimensionnement, JPEG, URL présignée, envoi, confirmation. */
export function StorageDebugUploadHook({
  file,
  entityType,
}: StorageDebugUploadHookProps): React.JSX.Element {
  const styles = useStyles(createStyles);
  const upload = useFileUpload(entityType);

  return (
    <View style={styles.container}>
      <AppButton
        text="Upload complet (hook useFileUpload)"
        variant="socio"
        disabled={file === null || upload.isPending}
        onPress={() => {
          if (file !== null) {
            upload.mutate({ uri: file.uri, width: file.width, height: file.height });
          }
        }}
      />
      {upload.isPending && <AppText style={styles.info}>Envoi en cours...</AppText>}
      {upload.data !== undefined && (
        <View>
          <AppText style={styles.success}>{`${upload.data.state} · ${upload.data.fileId}`}</AppText>
          {upload.data.publicUrl !== undefined && (
            <AppText style={styles.url} selectable>
              {upload.data.publicUrl}
            </AppText>
          )}
        </View>
      )}
      {upload.error !== null && <AppText style={styles.error}>{upload.error.message}</AppText>}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { marginTop: theme.spacing.md, gap: theme.spacing.sm },
    info: { color: theme.colors.grey },
    success: { color: theme.colors.badgeGreen, fontWeight: '600' },
    url: { color: theme.colors.primarySocio, fontSize: 11 },
    error: { color: theme.colors.danger },
  });
