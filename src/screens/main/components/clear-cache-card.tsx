import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { useClearCache } from '@/hooks/use-clear-cache';
import type { AppTheme } from '@/shared/themes/theme';

/** Entrée des paramètres pour vider le cache de l'application. */
export function ClearCacheCard(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { isClearing, clearCache } = useClearCache();

  return (
    <Pressable
      style={styles.card}
      onPress={() => {
        void clearCache();
      }}
      disabled={isClearing}
      accessibilityRole="button"
      accessibilityLabel="Vider le cache"
    >
      <View style={styles.iconContainer}>
        <AppIcons icon="trash-2" size={20} color={theme.colors.white} />
      </View>
      <View style={styles.text}>
        <AppText style={styles.title}>Vider le cache</AppText>
        <AppText style={styles.description}>
          {isClearing
            ? 'Suppression en cours...'
            : 'Supprime les données et images temporaires de l’application'}
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
      padding: theme.spacing.lg,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primarySocio,
      marginRight: theme.spacing.md,
    },
    text: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
    description: { fontSize: 14, color: theme.colors.grey, lineHeight: 20 },
  });
