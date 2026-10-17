import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import AppHeader from '@/components/layout/AppHeader';
import { AppText } from '@/components/typography/AppText';
import { ImpactRankRow } from '@/components/impact/impact-rank-row';
import { useProfile } from '@/api/user/hooks/use-profile';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import {
  IMPACT_RANKS,
  formatPoints,
  getImpactRankStatus,
  getRankState,
  type ImpactRank,
} from '@/shared/lib/impact-ranks';

const keyExtractor = (rank: ImpactRank): string => rank.name;

/** Page qui montre tous les rangs, ceux deja debloques et ceux qu'il reste a gagner. */
export function RanksScreen(): React.JSX.Element {
  const styles = useStyles(createStyles);
  const { data: profile } = useProfile();
  const status = getImpactRankStatus(profile?.totalImpactScore ?? 0);
  const { current } = status;

  const renderItem = useCallback(
    ({ item }: { item: ImpactRank }) => (
      <ImpactRankRow rank={item} state={getRankState(item, current)} />
    ),
    [current],
  );

  return (
    <View style={styles.container}>
      <AppHeader showBack />
      <FlatList
        data={IMPACT_RANKS}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={
          <View style={styles.intro}>
            <AppText variant="title">Les rangs</AppText>
            <AppText variant="caption" style={styles.muted}>
              Gagne des points d’impact en participant aux événements pour débloquer chaque rang.
            </AppText>
            <AppText variant="subtitle" style={styles.points}>
              {`Tes points : ${formatPoints(status.points)} pts`}
            </AppText>
          </View>
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
    intro: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    muted: {
      color: theme.colors.grey,
    },
    points: {
      color: theme.colors.primaryEco,
    },
  });
