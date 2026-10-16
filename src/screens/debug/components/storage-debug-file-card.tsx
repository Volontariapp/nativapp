import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import type { FileMetadataDTO, GenerateUploadUrlWebResponse } from '@volontariapp/contracts';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { describeFileInfo } from '../storage-debug.constants';
import type { DebugFile } from '../storage-debug.types';

interface StorageDebugFileCardProps {
  file: DebugFile | null;
  upload: GenerateUploadUrlWebResponse | null;
  fileInfo: FileMetadataDTO | null;
}

export function StorageDebugFileCard({
  file,
  upload,
  fileInfo,
}: StorageDebugFileCardProps): React.JSX.Element {
  const styles = useStyles(createStyles);

  if (file === null) {
    return <AppText style={styles.empty}>Aucune image choisie.</AppText>;
  }

  return (
    <View style={styles.card}>
      <Image source={{ uri: file.uri }} style={styles.preview} contentFit="cover" />
      <View style={styles.info}>
        <AppText style={styles.name}>
          {file.name} ({String(Math.round(file.sizeBytes / 1024))} Ko)
        </AppText>
        <AppText style={styles.line}>Type : {file.type}</AppText>
        {upload !== null && <AppText style={styles.line}>Fichier : {upload.fileId}</AppText>}
        {upload?.expiresAt !== undefined && (
          <AppText style={styles.line}>URL valable jusqu'à : {String(upload.expiresAt)}</AppText>
        )}
        {fileInfo !== null && <AppText style={styles.line}>{describeFileInfo(fileInfo)}</AppText>}
      </View>
      {fileInfo?.publicUrl !== undefined && (
        <View>
          <AppText style={styles.line}>Image servie par l'URL publique :</AppText>
          <Image source={{ uri: fileInfo.publicUrl }} style={styles.preview} contentFit="cover" />
          <AppText style={styles.url} selectable>
            {fileInfo.publicUrl}
          </AppText>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    empty: { color: theme.colors.grey, marginTop: theme.spacing.md },
    card: {
      backgroundColor: theme.colors.lightGrey,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    preview: { width: 120, height: 120, borderRadius: theme.radius.md },
    info: { gap: 2 },
    name: { fontWeight: '700' },
    line: { color: theme.colors.text },
    url: { color: theme.colors.primarySocio, fontSize: 11 },
  });
