import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface BadgeCatalogSummaryProps {
  unlockedCount: number;
  total: number;
}

/** Carte de synthèse du catalogue : « 2 / 13 débloqués » et barre de progression. */
export const BadgeCatalogSummary = ({
  unlockedCount,
  total,
}: BadgeCatalogSummaryProps): React.JSX.Element => {
  const styles = useStyles(createStyles);
  const ratio = total === 0 ? 0 : unlockedCount / total;

  return (
    <View style={styles.card}>
      <AppText
        style={styles.count}
      >{`${String(unlockedCount)} / ${String(total)} débloqués`}</AppText>
      <AppText style={styles.hint}>
        Chaque badge récompense une action précise : voici comment obtenir ceux qu'il te reste.
      </AppText>
      <View style={styles.track}>
        <View testID="badge-catalog-progress" style={[styles.fill, { flex: ratio }]} />
        <View style={{ flex: 1 - ratio }} />
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      gap: theme.spacing.sm,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      ...theme.shadows.card,
    },
    count: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primaryEco,
    },
    hint: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.grey,
    },
    track: {
      flexDirection: 'row',
      height: theme.spacing.sm,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.lightGrey,
      overflow: 'hidden',
    },
    fill: {
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.primaryEco,
    },
  });
