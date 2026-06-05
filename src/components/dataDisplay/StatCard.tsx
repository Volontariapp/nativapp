import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
}

/**
 * Composant réutilisable pour afficher une statistique sous forme de carte.
 * Utilisé principalement sur la page Profil.
 */
export const StatCard = ({ label, value, color = theme.colors.black }: StatCardProps): React.JSX.Element => {
  return (
    <View style={styles.statCard}>
      <AppText style={styles.statLabel}>{label}</AppText>
      <AppText style={[styles.statValue, { color }]}>
        {value}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
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
