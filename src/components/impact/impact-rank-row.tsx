import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { formatPoints, type ImpactRank, type ImpactRankState } from '@/shared/lib/impact-ranks';

interface ImpactRankRowProps {
  rank: ImpactRank;
  state: ImpactRankState;
}

const STATE_LABEL: Record<ImpactRankState, string> = {
  unlocked: 'Débloqué',
  current: 'Rang actuel',
  locked: 'Verrouillé',
};

const STATE_ICON: Record<ImpactRankState, string> = {
  unlocked: 'check-circle',
  current: 'star',
  locked: 'lock',
};

interface RankTone {
  row: 'rowUnlocked' | 'rowCurrent' | 'rowLocked';
  name: 'nameActive' | 'nameLocked';
  state: 'stateActive' | 'stateLocked';
  icon: 'primaryEco' | 'grey';
}

/** Apparence par etat : une table plutot que des branches dans le rendu. */
const TONE: Record<ImpactRankState, RankTone> = {
  unlocked: { row: 'rowUnlocked', name: 'nameActive', state: 'stateActive', icon: 'primaryEco' },
  current: { row: 'rowCurrent', name: 'nameActive', state: 'stateActive', icon: 'primaryEco' },
  locked: { row: 'rowLocked', name: 'nameLocked', state: 'stateLocked', icon: 'grey' },
};

/** Une ligne de la page des rangs : nom, accroche, seuil de points et etat du rang. */
export const ImpactRankRow = ({ rank, state }: ImpactRankRowProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const tone = TONE[state];

  return (
    <View
      accessible
      accessibilityLabel={`${rank.name}, ${STATE_LABEL[state].toLowerCase()}`}
      style={[styles.row, styles[tone.row]]}
    >
      <AppIcons icon={STATE_ICON[state]} size={22} color={theme.colors[tone.icon]} />
      <View style={styles.body}>
        <AppText variant="subtitle" style={styles[tone.name]}>
          {rank.name}
        </AppText>
        <AppText variant="caption" style={styles.tagline}>
          {rank.tagline}
        </AppText>
      </View>
      <View style={styles.meta}>
        <AppText variant="caption" style={styles.threshold}>
          {`${formatPoints(rank.minPoints)} pts`}
        </AppText>
        <AppText variant="caption" style={styles[tone.state]}>
          {STATE_LABEL[state]}
        </AppText>
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.separator,
    },
    rowUnlocked: {
      backgroundColor: theme.colors.white,
    },
    rowCurrent: {
      backgroundColor: theme.colors.lightGrey,
    },
    rowLocked: {
      backgroundColor: theme.colors.white,
      opacity: 0.6,
    },
    body: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    nameActive: {
      color: theme.colors.primaryEco,
      letterSpacing: 1,
    },
    nameLocked: {
      color: theme.colors.grey,
      letterSpacing: 1,
    },
    tagline: {
      color: theme.colors.grey,
    },
    meta: {
      alignItems: 'flex-end',
      gap: theme.spacing.xs,
    },
    threshold: {
      color: theme.colors.text,
    },
    stateActive: {
      color: theme.colors.primaryEco,
    },
    stateLocked: {
      color: theme.colors.grey,
    },
  });
