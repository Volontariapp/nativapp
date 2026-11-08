import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface LeaderboardPagerProps {
  pageNumber: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const ICON_SIZE = 18;

/** Navigation du classement : page précédente, numéro de la page affichée, page suivante. */
export const LeaderboardPager = ({
  pageNumber,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: LeaderboardPagerProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const activeColor = theme.colors.primaryEco;
  const disabledColor = theme.colors.grey;

  return (
    <View testID="leaderboard-pager" style={styles.container}>
      <Pressable
        testID="leaderboard-pager-previous"
        style={[styles.button, !hasPrevious && styles.buttonDisabled]}
        onPress={onPrevious}
        disabled={!hasPrevious}
        accessibilityRole="button"
        accessibilityLabel="Page précédente"
        accessibilityState={{ disabled: !hasPrevious }}
      >
        <Icon
          name="chevron-left"
          size={ICON_SIZE}
          color={hasPrevious ? activeColor : disabledColor}
        />
        <AppText style={[styles.buttonText, !hasPrevious && styles.buttonTextDisabled]}>
          Précédent
        </AppText>
      </Pressable>

      <AppText style={styles.page}>{`Page ${String(pageNumber)}`}</AppText>

      <Pressable
        testID="leaderboard-pager-next"
        style={[styles.button, !hasNext && styles.buttonDisabled]}
        onPress={onNext}
        disabled={!hasNext}
        accessibilityRole="button"
        accessibilityLabel="Page suivante"
        accessibilityState={{ disabled: !hasNext }}
      >
        <AppText style={[styles.buttonText, !hasNext && styles.buttonTextDisabled]}>
          Suivant
        </AppText>
        <Icon name="chevron-right" size={ICON_SIZE} color={hasNext ? activeColor : disabledColor} />
      </Pressable>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.badgeEcoBackground,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.lightGrey,
    },
    buttonText: {
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primaryEco,
    },
    buttonTextDisabled: {
      color: theme.colors.grey,
    },
    page: {
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.grey,
    },
  });
