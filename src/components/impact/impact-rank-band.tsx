import React from 'react';
import { Pressable, StyleSheet, View, type DimensionValue } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { formatPoints, type ImpactRankStatus } from '@/shared/lib/impact-ranks';

interface ImpactRankBandProps {
  status: ImpactRankStatus;
  onPress?: () => void;
}

const getFillWidth = (ratio: number): DimensionValue =>
  `${String(Math.round(ratio * 100))}%` as DimensionValue;

const getCaption = ({ next, pointsToNext }: ImpactRankStatus): string =>
  next === null
    ? 'Rang maximum atteint, tu es au sommet'
    : `Plus que ${formatPoints(pointsToNext)} pts pour devenir ${next.name}`;

/**
 * Frise pleine largeur (pas une carte) : rang courant, points cumules et distance au rang
 * suivant. Un appui ouvre la page de tous les rangs.
 */
export const ImpactRankBand = ({ status, onPress }: ImpactRankBandProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <Pressable
      testID="impact-rank-band"
      accessibilityRole="button"
      accessibilityLabel="Voir tous les rangs"
      onPress={onPress}
      style={styles.band}
    >
      <View style={styles.headerRow}>
        <View>
          <AppText variant="caption" style={styles.kicker}>
            RANG
          </AppText>
          <AppText variant="title" style={styles.rankName}>
            {status.current.name}
          </AppText>
        </View>
        <AppText variant="subtitle">{`${formatPoints(status.points)} pts`}</AppText>
      </View>

      <View style={styles.track}>
        <View
          testID="impact-rank-progress-fill"
          style={[styles.fill, { width: getFillWidth(status.ratio) }]}
        />
      </View>

      <View style={styles.footerRow}>
        <AppText variant="caption" style={styles.caption}>
          {getCaption(status)}
        </AppText>
        <AppIcons icon="chevron-right" size={16} color={theme.colors.grey} />
      </View>
    </Pressable>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    band: {
      backgroundColor: theme.colors.white,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.separator,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    kicker: {
      color: theme.colors.grey,
      letterSpacing: 2,
    },
    rankName: {
      color: theme.colors.primaryEco,
      letterSpacing: 1,
    },
    track: {
      height: theme.spacing.sm,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.lightGrey,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.primaryEco,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    caption: {
      flex: 1,
      color: theme.colors.grey,
    },
  });
