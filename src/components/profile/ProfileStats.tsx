import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatCard } from '@/components/dataDisplay/StatCard';
import { theme } from '@/shared/themes/theme';

interface ProfileStatsProps {
  impactScore: number;
  badgesCount: number;
  eventsCount: number;
}

/**
 * Section des statistiques de l'utilisateur sur son profil.
 */
export const ProfileStats = ({
  impactScore,
  badgesCount,
  eventsCount,
}: ProfileStatsProps): React.JSX.Element => {
  return (
    <View style={styles.statsContainer}>
      <StatCard label="Impact" value={impactScore} color={theme.colors.primaryEco} />
      <StatCard label="Badges" value={badgesCount} color={theme.colors.secondarySocio} />
      <StatCard label="Events" value={eventsCount} color={theme.colors.warning} />
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
});
