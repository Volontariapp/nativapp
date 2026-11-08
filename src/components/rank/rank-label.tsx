import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import {
  rankDistinctionLabel,
  rankIconKind,
  rankPaletteKeys,
} from '@/shared/lib/rank/rank-palette';
import type { RankDistinction } from '@/shared/lib/rank/rank.types';
import type { AppTheme } from '@/shared/themes/theme';
import { RankIcon } from './rank-icon';

interface RankLabelProps {
  distinction: RankDistinction;
  /** Icône seule, sans texte : pour les lignes denses (commentaires, listes). */
  iconOnly?: boolean;
  style?: StyleProp<ViewStyle>;
}

const ICON_SIZE = 14;

/** Icône et libellé d'une distinction, aux couleurs de son thème. */
export const RankLabel = ({
  distinction,
  iconOnly = false,
  style,
}: RankLabelProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const keys = rankPaletteKeys(distinction);
  const label = rankDistinctionLabel(distinction);

  return (
    <View
      testID="rank-label"
      style={[styles.row, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <RankIcon
        kind={rankIconKind(distinction)}
        size={ICON_SIZE}
        color={theme.colors[keys.border]}
      />
      {!iconOnly && (
        <AppText style={[styles.text, { color: theme.colors[keys.text] }]}>{label}</AppText>
      )}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    text: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
  });
