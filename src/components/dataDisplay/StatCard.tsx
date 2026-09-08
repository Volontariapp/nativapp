import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
}

/**
 * Composant réutilisable pour afficher une statistique sous forme de carte.
 * Utilisé principalement sur la page Profil.
 */
export const StatCard = ({ label, value, color }: StatCardProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const resolvedColor = color ?? theme.colors.text;

  return (
    <View style={styles.statCard}>
      <AppText style={styles.statLabel}>{label}</AppText>
      <AppText style={[styles.statValue, { color: resolvedColor }]}>{value}</AppText>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.white,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      ...theme.shadows.card,
    },
    statLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.grey,
      textTransform: 'uppercase',
      marginBottom: theme.spacing.xs,
    },
    statValue: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
    },
  });
