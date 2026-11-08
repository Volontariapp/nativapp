import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LeaderboardEntryWeb, LeaderboardScopeWeb } from '@volontariapp/contracts';
import AppHeader from '@/components/layout/AppHeader';
import { AppText } from '@/components/typography/AppText';
import { LeaderboardPager } from '@/components/rank/leaderboard-pager';
import { LeaderboardRow } from '@/components/rank/leaderboard-row';
import { LeaderboardTabs } from '@/components/rank/leaderboard-tabs';
import { MyRankCard } from '@/components/rank/my-rank-card';
import { useLeaderboardPage } from '@/api/user/hooks/use-leaderboard-page';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import {
  INITIAL_LEADERBOARD_PAGER,
  pagerCursor,
  pagerHasPrevious,
  pagerNext,
  pagerPageNumber,
  pagerPrevious,
  type LeaderboardPagerState,
} from '@/shared/lib/rank/leaderboard-pager';
import type { AppTheme } from '@/shared/themes/theme';

const keyExtractor = (entry: LeaderboardEntryWeb): string => entry.userId;

/** Classement des bénévoles par points, par pages de dix : global, mois ou semaine. */
export function LeaderboardScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { userId: currentUserId } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [scope, setScope] = useState<LeaderboardScopeWeb>('global');
  const [pager, setPager] = useState<LeaderboardPagerState>(INITIAL_LEADERBOARD_PAGER);

  const { data, isLoading, isError, isFetching, refetch } = useLeaderboardPage(
    scope,
    pagerCursor(pager),
  );
  const entries = useMemo(() => data?.entries ?? [], [data]);
  const visibleUserIds = useMemo(() => entries.map((entry) => entry.userId), [entries]);

  const changeScope = useCallback((next: LeaderboardScopeWeb): void => {
    setScope(next);
    setPager(INITIAL_LEADERBOARD_PAGER);
  }, []);

  const openProfile = useCallback(
    (userId: string): void => {
      navigation.navigate('PublicProfile', { userId });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: LeaderboardEntryWeb }): React.JSX.Element => (
      <LeaderboardRow
        entry={item}
        scope={scope}
        isMe={item.userId === currentUserId}
        onPress={openProfile}
      />
    ),
    [scope, currentUserId, openProfile],
  );

  const renderEmpty = (): React.JSX.Element | null => {
    if (isLoading) return <ActivityIndicator color={theme.colors.primaryEco} />;
    if (isError) {
      return <AppText style={styles.message}>Impossible de charger le classement.</AppText>;
    }
    return (
      <AppText style={styles.message}>Personne n'est encore classé sur cette période.</AppText>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader showBack />
      <FlatList
        data={entries}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={isFetching && !isLoading}
        onRefresh={() => {
          void refetch();
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="title">Le classement</AppText>
            <LeaderboardTabs scope={scope} onChange={changeScope} />
          </View>
        }
        ListEmptyComponent={renderEmpty()}
        ListFooterComponent={
          entries.length === 0 ? null : (
            <LeaderboardPager
              pageNumber={pagerPageNumber(pager)}
              hasPrevious={pagerHasPrevious(pager)}
              hasNext={data?.nextCursor !== undefined}
              onPrevious={() => {
                setPager(pagerPrevious);
              }}
              onNext={() => {
                setPager((current) => pagerNext(current, data?.nextCursor));
              }}
            />
          )
        }
      />
      <View style={styles.pinned}>
        <MyRankCard scope={scope} visibleUserIds={visibleUserIds} />
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
    },
    header: {
      gap: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
    message: {
      textAlign: 'center',
      color: theme.colors.grey,
      paddingVertical: theme.spacing.xl,
    },
    pinned: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
    },
  });
