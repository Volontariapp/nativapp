import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { AppButton } from '@/components/buttons/AppButton';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { StorageDebugFileCard } from './components/storage-debug-file-card';
import { StorageDebugLogs } from './components/storage-debug-logs';
import { useStorageDebug } from './hooks/use-storage-debug';
import { ENTITY_OPTIONS } from './storage-debug.constants';

export function StorageDebugScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const debug = useStorageDebug();

  const hasFile = debug.file !== null;
  const hasUrl = debug.upload !== null;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <Pressable
          style={styles.backButton}
          accessibilityLabel="Retour"
          onPress={() => {
            navigation.goBack();
          }}
        >
          <AppIcons icon="arrow-left" size={24} color={theme.colors.black} />
        </Pressable>
        <AppText style={styles.topBarTitle}>Test du stockage</AppText>
        <View style={styles.backButton} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <AppText style={styles.section}>Type d'entité</AppText>
        <View style={styles.chips}>
          {ENTITY_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[styles.chip, debug.entityType === option.value && styles.chipActive]}
              onPress={() => {
                debug.setEntityType(option.value);
              }}
            >
              <AppText
                style={debug.entityType === option.value ? styles.chipTextActive : undefined}
              >
                {option.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        <AppText style={styles.section}>Fichier</AppText>
        <AppButton
          text="Choisir une image"
          variant="socio"
          onPress={() => void debug.pickImage()}
        />
        <StorageDebugFileCard file={debug.file} upload={debug.upload} fileInfo={debug.fileInfo} />

        <AppText style={styles.section}>Étapes</AppText>
        <View style={styles.steps}>
          <AppButton
            text="1. URL présignée"
            size="small"
            disabled={!hasFile || debug.isRunning}
            onPress={() => void debug.requestUrl()}
          />
          <AppButton
            text="2. Envoyer vers S3"
            size="small"
            disabled={!hasUrl || debug.isRunning}
            onPress={() => void debug.sendFile()}
          />
          <AppButton
            text="3. Confirmer"
            size="small"
            disabled={!debug.isUploaded || debug.isRunning}
            onPress={() => void debug.confirm()}
          />
          <AppButton
            text="4. Lire les métadonnées"
            size="small"
            disabled={!hasUrl || debug.isRunning}
            onPress={() => void debug.readMetadata()}
          />
        </View>
        <AppButton
          text="Tout enchaîner"
          disabled={!hasFile || debug.isRunning}
          onPress={() => void debug.runAll()}
          style={styles.runAll}
        />

        <StorageDebugLogs logs={debug.logs} onClear={debug.clearLogs} />
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
    },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    topBarTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
    section: { fontWeight: '700', marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
    chip: {
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.grey,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    chipActive: {
      backgroundColor: theme.colors.primarySocio,
      borderColor: theme.colors.primarySocio,
    },
    chipTextActive: { color: theme.colors.white },
    steps: { gap: theme.spacing.sm },
    runAll: { marginTop: theme.spacing.md },
  });
