import React from 'react';
import { Pressable, StyleSheet, View, type DimensionValue } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useStyles } from '@/context/ThemeContext';
import { lightTheme, type AppTheme } from '@/shared/themes/theme';
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
        <AppText variant="subtitle" style={styles.points}>
          {`${formatPoints(status.points)} pts`}
        </AppText>
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
        <AppIcons icon="chevron-right" size={16} color={lightTheme.colors.white} />
      </View>
    </Pressable>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    band: {
      backgroundColor: theme.colors.primaryEco,
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
      color: lightTheme.colors.white,
      opacity: 0.8,
      letterSpacing: 2,
    },
    rankName: {
      color: lightTheme.colors.white,
      letterSpacing: 1,
    },
    track: {
      height: theme.spacing.sm,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.whiteOverlay,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.gold,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    points: {
      color: lightTheme.colors.white,
    },
    caption: {
      flex: 1,
      color: lightTheme.colors.white,
    },
  });
