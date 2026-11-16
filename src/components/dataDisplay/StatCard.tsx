import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  onPress?: () => void;
  testID?: string;
}

/**
 * Composant réutilisable pour afficher une statistique sous forme de carte.
 * Utilisé principalement sur la page Profil.
 */
export const StatCard = ({
  label,
  value,
  color,
  onPress,
  testID,
}: StatCardProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const resolvedColor = color ?? theme.colors.text;

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.statCard, pressed && styles.statCardPressed]}
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${String(value)}`}
      >
        <AppText style={styles.statLabel}>{label}</AppText>
        <AppText style={[styles.statValue, { color: resolvedColor }]}>{value}</AppText>
      </Pressable>
    );
  }

  return (
    <View style={styles.statCard} testID={testID}>
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
    statCardPressed: {
      opacity: 0.75,
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
