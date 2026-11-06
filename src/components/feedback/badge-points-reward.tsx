import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { formatPoints } from '@/components/dataDisplay/badge/badge-progress.utils';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface BadgePointsRewardProps {
  points: number;
}

/** Pastille « +250 pts » de la modale de félicitations d'un badge. */
export const BadgePointsReward = ({ points }: BadgePointsRewardProps): React.JSX.Element => {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.pill} accessible accessibilityLabel={`${String(points)} points gagnés`}>
      <AppText style={styles.text}>{formatPoints(points)}</AppText>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    pill: {
      alignSelf: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.badgeGreenBackground,
    },
    text: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.badgeGreen,
    },
  });
