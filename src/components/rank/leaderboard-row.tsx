import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { LeaderboardEntryWeb, LeaderboardScopeWeb } from '@volontariapp/contracts';
import { UserAvatar } from '@/components/media/UserAvatar';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { isRankTier } from '@/shared/lib/rank/rank-distinction';
import type { RankDistinction } from '@/shared/lib/rank/rank.types';
import type { AppTheme } from '@/shared/themes/theme';
import { RankLabel } from './rank-label';
import { buildRankFrameStyle } from './use-rank-frame-style';

interface LeaderboardRowProps {
  entry: LeaderboardEntryWeb;
  scope: LeaderboardScopeWeb;
  isMe: boolean;
  onPress: (userId: string) => void;
}

const AVATAR_SIZE = 40;

/** Une ligne du classement. Les trois premiers du classement affiché reçoivent leur cadre. */
export const LeaderboardRow = ({
  entry,
  scope,
  isMe,
  onPress,
}: LeaderboardRowProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const distinction: RankDistinction | undefined = isRankTier(entry.rank)
    ? { scope, tier: entry.rank }
    : undefined;
  const frameStyle =
    distinction === undefined ? undefined : buildRankFrameStyle(theme, distinction, 'thin');

  return (
    <Pressable
      testID="leaderboard-row"
      style={[styles.row, isMe && styles.rowMe, frameStyle]}
      onPress={() => {
        onPress(entry.userId);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${String(entry.rank)}e, ${entry.pseudo}, ${String(entry.points)} points`}
    >
      <View style={styles.rankColumn}>
        {distinction === undefined ? (
          <AppText style={styles.rankText}>{entry.rank}</AppText>
        ) : (
          <RankLabel distinction={distinction} iconOnly />
        )}
      </View>
      <UserAvatar uri={entry.avatarUrl} size={AVATAR_SIZE} style={styles.avatar} />
      <AppText style={styles.pseudo} numberOfLines={1}>
        {entry.pseudo}
      </AppText>
      <AppText style={styles.points}>{entry.points} pts</AppText>
    </Pressable>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
    },
    rowMe: {
      borderColor: theme.colors.primaryEco,
    },
    rankColumn: {
      width: 36,
      alignItems: 'center',
    },
    rankText: {
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.grey,
    },
    avatar: {
      marginHorizontal: theme.spacing.md,
    },
    pseudo: {
      flex: 1,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
    },
    points: {
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primaryEco,
    },
  });
