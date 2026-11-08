import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { sendMonitoringTestError } from '@/shared/lib/monitoring';

/** Envoie une erreur de test a Datadog pour verifier le monitoring. Visible en mode debug seulement. */
export function MonitoringTestErrorButton(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const handlePress = (): void => {
    void sendMonitoringTestError().then((sent) => {
      Alert.alert(
        sent ? 'Erreur de test envoyée' : 'Monitoring inactif',
        sent
          ? 'Elle apparaît dans Datadog (Error Tracking) sous quelques minutes.'
          : 'Les identifiants Datadog manquent dans ce build.',
      );
    });
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.iconContainer}>
        <AppIcons icon="alert-triangle" size={20} color={theme.colors.white} />
      </View>
      <View style={styles.text}>
        <AppText style={styles.title}>Test du monitoring</AppText>
        <AppText style={styles.description}>
          Envoie une erreur de test à Datadog (aucune donnée personnelle)
        </AppText>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.lightGrey,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    iconContainer: {
      backgroundColor: theme.colors.primarySocio,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
      marginRight: theme.spacing.md,
    },
    text: { flex: 1 },
    title: { fontWeight: '700' },
    description: { color: theme.colors.grey },
  });
