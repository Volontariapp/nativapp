import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { BadgeProgressWeb } from '@volontariapp/contracts';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { BadgeProgressBar } from './badge-progress-bar';
import { describeRequirement, formatPoints } from './badge-progress.utils';

interface BadgeCatalogProgressProps {
  progress: BadgeProgressWeb;
}

/** Avancement d'un badge pas encore obtenu : pourcentage, barre, exigences et récompense. */
export const BadgeCatalogProgress = ({ progress }: BadgeCatalogProgressProps): React.JSX.Element => {
  const styles = useStyles(createStyles);

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: progress.percent }}
    >
      <View style={styles.header}>
        <AppText style={styles.percent}>{`${String(progress.percent)} %`}</AppText>
        <AppText style={styles.reward}>{`Récompense : ${formatPoints(progress.points)}`}</AppText>
      </View>
      <BadgeProgressBar ratio={progress.percent / 100} testID={`badge-progress-${progress.slug}`} />
      {progress.requirements.map((requirement) => (
        <AppText key={requirement.metric} style={styles.requirement}>
          {describeRequirement(requirement)}
        </AppText>
      ))}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    percent: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primaryEco,
    },
    reward: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
    requirement: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
  });
