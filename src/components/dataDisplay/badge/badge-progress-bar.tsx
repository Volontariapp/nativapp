import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface BadgeProgressBarProps {
  /** Part remplie, de 0 a 1. */
  ratio: number;
  testID?: string;
}

/** Barre de progression partagee par la synthese du catalogue et par chaque badge en cours. */
export const BadgeProgressBar = ({ ratio, testID }: BadgeProgressBarProps): React.JSX.Element => {
  const styles = useStyles(createStyles);
  const filled = Math.min(Math.max(ratio, 0), 1);

  return (
    <View style={styles.track}>
      <View testID={testID} style={[styles.fill, { flex: filled }]} />
      <View style={{ flex: 1 - filled }} />
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
