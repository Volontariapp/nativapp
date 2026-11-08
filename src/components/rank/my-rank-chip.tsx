import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useMyRank } from '@/api/user/hooks/use-my-rank';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { formatRankTier } from '@/shared/lib/rank/format-rank-tier';
import type { AppTheme } from '@/shared/themes/theme';

interface MyRankChipProps {
  onPress: () => void;
}

const CHEVRON_SIZE = 16;

/** Mon rang au classement général (« N° 12 », « Top 1 000 »). Ouvre le classement. */
export const MyRankChip = ({ onPress }: MyRankChipProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { data } = useMyRank('global');
  const label =
    data?.me === undefined ? 'Voir le classement' : `${formatRankTier(data.me.rank)} au classement`;

  return (
    <Pressable
      testID="my-rank-chip"
      style={styles.chip}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon name="award" size={CHEVRON_SIZE} color={theme.colors.primaryEco} />
      <AppText style={styles.label}>{label}</AppText>
      <Icon name="chevron-right" size={CHEVRON_SIZE} color={theme.colors.grey} />
    </Pressable>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.badgeEcoBackground,
    },
    label: {
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primaryEco,
    },
  });
