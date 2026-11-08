import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { LeaderboardScopeWeb } from '@volontariapp/contracts';
import { useMyRank } from '@/api/user/hooks/use-my-rank';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import { formatRankTier } from '@/shared/lib/rank/format-rank-tier';
import type { AppTheme } from '@/shared/themes/theme';

interface MyRankCardProps {
  scope: LeaderboardScopeWeb;
}

const SCOPE_PERIOD: Record<LeaderboardScopeWeb, string> = {
  global: 'au classement général',
  month: 'ce mois-ci',
  week: 'cette semaine',
};

/** Ma position sur le classement affiché, ou une invitation à gagner des points quand je n'en ai pas. */
export const MyRankCard = ({ scope }: MyRankCardProps): React.JSX.Element | null => {
  const styles = useStyles(createStyles);
  const { data, isLoading } = useMyRank(scope);

  if (isLoading || data === undefined) return null;

  const me = data.me;
  return (
    <View testID="my-rank-card" style={styles.card}>
      {me === undefined ? (
        <AppText style={styles.hint}>
          Participe à un évènement pour apparaître dans ce classement.
        </AppText>
      ) : (
        <>
          <AppText style={styles.rank}>{formatRankTier(me.rank)}</AppText>
          <AppText style={styles.detail}>
            {`${SCOPE_PERIOD[scope]}, avec ${String(me.points)} pts`}
          </AppText>
        </>
      )}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.lg,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.badgeEcoBackground,
      borderWidth: 1,
      borderColor: theme.colors.primaryEco,
      gap: theme.spacing.xs,
    },
    rank: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primaryEco,
    },
    detail: {
      color: theme.colors.text,
    },
    hint: {
      color: theme.colors.text,
    },
  });
