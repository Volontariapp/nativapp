import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatCard } from '@/components/dataDisplay/StatCard';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface ProfileStatsProps {
  impactScore: number;
  badgesCount: number;
  eventsCount: number;
  createdCount: number;
}

/**
 * Section des statistiques de l'utilisateur sur son profil.
 */
export const ProfileStats = ({
  impactScore,
  badgesCount,
  eventsCount,
  createdCount,
}: ProfileStatsProps): React.JSX.Element => {
  const styles = useStyles(createStyles);
  const { theme } = useAppTheme();
  return (
    <View style={styles.statsContainer}>
      <StatCard label="Impact" value={impactScore} color={theme.colors.primaryEco} />
      <StatCard label="Badges" value={badgesCount} color={theme.colors.secondarySocio} />
      <StatCard label="Rejoints" value={eventsCount} color={theme.colors.warning} />
      <StatCard label="Créés" value={createdCount} color={theme.colors.primarySocio} />
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
