import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { STEP_LABELS } from '../storage-debug.constants';
import type { DebugLogEntry } from '../storage-debug.types';

interface StorageDebugLogsProps {
  logs: DebugLogEntry[];
  onClear: () => void;
}

export function StorageDebugLogs({ logs, onClear }: StorageDebugLogsProps): React.JSX.Element {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText style={styles.title}>Journal</AppText>
        <Pressable onPress={onClear} accessibilityLabel="Vider le journal">
          <AppText style={styles.clear}>Vider</AppText>
        </Pressable>
      </View>
      {logs.length === 0 ? (
        <AppText style={styles.empty}>Aucune action pour l'instant.</AppText>
      ) : (
        logs.map((entry) => (
          <View key={entry.id} style={styles.entry}>
            <AppText style={[styles.status, entry.status === 'error' && styles.statusError]}>
              {entry.status === 'ok' ? 'OK' : 'ECHEC'} · {STEP_LABELS[entry.step]} ·{' '}
              {String(entry.durationMs)} ms
            </AppText>
            <AppText style={styles.message}>{entry.message}</AppText>
          </View>
        ))
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.lightGrey,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    title: { fontWeight: '700' },
    clear: { color: theme.colors.primarySocio },
    empty: { color: theme.colors.grey },
    entry: { marginTop: theme.spacing.sm },
    status: { fontWeight: '600', color: theme.colors.badgeGreen },
    statusError: { color: theme.colors.danger },
    message: { color: theme.colors.text },
  });
