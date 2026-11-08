import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useUserDistinction } from '@/api/user/hooks/use-user-distinction';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { RankFrameIntensity } from '@/shared/lib/rank/rank.types';
import type { AppTheme } from '@/shared/themes/theme';
import { RankLabel } from './rank-label';
import { buildRankFrameStyle } from './use-rank-frame-style';

interface RankFrameProps {
  /** Utilisateur dont on affiche le cadre ; sans podium, les enfants s'affichent tels quels. */
  userId: string | undefined;
  intensity: RankFrameIntensity;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Contour posé autour d'un bloc (pseudo et bio du profil, post) pour les trois premiers d'un
 * classement. Hors podium, ne change rien à la mise en page.
 */
export const RankFrame = ({
  userId,
  intensity,
  children,
  style,
}: RankFrameProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const distinction = useUserDistinction(userId);

  if (distinction === undefined) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View
      testID="rank-frame"
      style={[styles.frame, buildRankFrameStyle(theme, distinction, intensity), style]}
    >
      {intensity === 'thin' ? null : <RankLabel distinction={distinction} style={styles.label} />}
      {children}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    frame: {
      padding: theme.spacing.md,
      overflow: 'visible',
    },
    label: {
      marginBottom: theme.spacing.sm,
    },
  });
