import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { formatPoints, type ImpactRankStatus } from '@/shared/lib/impact-ranks';

interface ProfileNextRankProps {
  status: ImpactRankStatus;
  onPress?: () => void;
}

/**
 * Carte « prochain rang à débloquer » du profil : nom du rang visé, points manquants et
 * progression dans le rang courant. Un appui ouvre la page de tous les rangs.
 */
export const ProfileNextRank = ({ status, onPress }: ProfileNextRankProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { next, pointsToNext, ratio } = status;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voir tous les rangs"
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.iconTile}>
        <AppIcons
          icon={next === null ? 'award' : 'unlock'}
          iconLibrary="Feather"
          size={22}
          color={theme.colors.primaryEco}
        />
      </View>

      <View style={styles.body}>
        <AppText style={styles.kicker}>{next === null ? 'RANG' : 'PROCHAIN RANG'}</AppText>
        <AppText style={styles.rankName} numberOfLines={1}>
          {next === null ? status.current.name : next.name}
        </AppText>

        {next !== null && (
          <View style={styles.track}>
            <View testID="profile-next-rank-fill" style={[styles.fill, { flex: ratio }]} />
            <View style={{ flex: 1 - ratio }} />
          </View>
        )}

        <AppText style={styles.caption}>
          {next === null ? 'Rang maximum atteint' : `Plus que ${formatPoints(pointsToNext)} pts`}
        </AppText>
      </View>

      <AppIcons icon="chevron-right" iconLibrary="Feather" size={20} color={theme.colors.grey} />
    </Pressable>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      ...theme.shadows.card,
    },
    iconTile: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.badgeEcoBackground,
    },
    body: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    kicker: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.grey,
      letterSpacing: 1,
    },
    rankName: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.black,
    },
    track: {
      flexDirection: 'row',
      height: theme.spacing.sm,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.lightGrey,
      overflow: 'hidden',
    },
    fill: {
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.primaryEco,
    },
    caption: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
  });
