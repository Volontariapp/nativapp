import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatCard } from '@/components/dataDisplay/StatCard';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

export interface ProfileStatItem {
  label: string;
  value: number;
  color: string;
}

interface ProfileStatsProps {
  stats: ProfileStatItem[];
}

/**
 * Section des statistiques de l'utilisateur sur son profil.
 */
export const ProfileStats = ({ stats }: ProfileStatsProps): React.JSX.Element => {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.statsContainer}>
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} color={stat.color} />
      ))}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      flexWrap: 'wrap',
    },
  });
