import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LeaderboardEntryWeb, LeaderboardScopeWeb } from '@volontariapp/contracts';
import AppHeader from '@/components/layout/AppHeader';
import { AppText } from '@/components/typography/AppText';
import { LeaderboardRow } from '@/components/rank/leaderboard-row';
import { LeaderboardTabs } from '@/components/rank/leaderboard-tabs';
import { MyRankCard } from '@/components/rank/my-rank-card';
import { useInfiniteLeaderboard } from '@/api/user/hooks/use-infinite-leaderboard';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import type { AppTheme } from '@/shared/themes/theme';

const keyExtractor = (entry: LeaderboardEntryWeb): string => entry.userId;

/** Classement des bénévoles par points : global, mois ou semaine, avec ma position. */
export function LeaderboardScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { userId: currentUserId } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [scope, setScope] = useState<LeaderboardScopeWeb>('global');

  const {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteLeaderboard(scope);
  const entries = useMemo(() => data?.pages.flatMap((page) => page.entries) ?? [], [data]);

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

  const handleEndReached = useCallback((): void => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback((): void => {
    void refetch();
  }, [refetch]);

  const renderEmpty = (): React.JSX.Element | null => {
    if (isLoading) return <ActivityIndicator color={theme.colors.primaryEco} />;
    if (isError)
      return <AppText style={styles.message}>Impossible de charger le classement.</AppText>;
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
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        refreshing={isRefetching}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="title">Le classement</AppText>
            <LeaderboardTabs scope={scope} onChange={setScope} />
            <MyRankCard scope={scope} />
          </View>
        }
        ListEmptyComponent={renderEmpty()}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator color={theme.colors.primaryEco} /> : null
        }
      />
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
      paddingBottom: theme.spacing.xxl,
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
  });
