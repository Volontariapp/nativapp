import React from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { ParticipationProgress } from '@/shared/lib/impact-progress.utils';
import type { ImpactCardProps } from './impact-card.types';

const formatEventDate = (startAt: string): string =>
  new Date(startAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const getFillWidth = (ratio: number): DimensionValue =>
  `${String(Math.round(ratio * 100))}%` as DimensionValue;

const getProgressLabel = ({
  allTiersReached,
  nextTier,
  remaining,
}: ParticipationProgress): string => {
  if (allTiersReached || nextTier === null) {
    return 'Tous les badges de participation sont débloqués';
  }
  const lead = remaining === 1 ? 'Plus qu’1 événement' : `Plus que ${String(remaining)} événements`;
  return `${lead} avant le badge « ${nextTier.name} »`;
};

export const ImpactCard = ({
  isLoading,
  totalImpactScore,
  progress,
  nextEvent,
}: ImpactCardProps): React.JSX.Element => {
  const styles = useStyles(createStyles);

  if (isLoading) {
    return (
      <View style={styles.card}>
        <AppText variant="subtitle">Mon impact</AppText>
        <AppText variant="caption" style={styles.muted}>
          Chargement de ton impact...
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <AppText variant="subtitle">Mon impact</AppText>
      <AppText variant="bigTitle" style={styles.score}>
        {String(totalImpactScore)}
      </AppText>

      <View style={styles.track}>
        <View
          testID="impact-progress-fill"
          style={[styles.fill, { width: getFillWidth(progress.ratio) }]}
        />
      </View>
      <AppText variant="caption" style={styles.muted}>
        {getProgressLabel(progress)}
      </AppText>

      <View style={styles.separator} />

      {nextEvent === null ? (
        <AppText variant="caption" style={styles.muted}>
          Aucun événement à venir. Inscris-toi à un événement pour progresser.
        </AppText>
      ) : (
        <View>
          <AppText variant="caption" style={styles.muted}>
            Prochain événement
          </AppText>
          <AppText>{nextEvent.title}</AppText>
          <AppText variant="caption" style={styles.muted}>
            {formatEventDate(nextEvent.startAt)}
          </AppText>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    score: {
      color: theme.colors.primaryEco,
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
    muted: {
      color: theme.colors.grey,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.separator,
    },
  });
