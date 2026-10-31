import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface ProfileEventsCarouselNavProps {
  /** Position courante, à partir de 0. */
  index: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}

const ARROW_ICON_SIZE = 20;

interface ArrowProps {
  icon: 'chevron-left' | 'chevron-right';
  label: string;
  onPress: () => void;
}

function Arrow({ icon, label, onPress }: ArrowProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={styles.arrow}
    >
      <Feather name={icon} size={ARROW_ICON_SIZE} color={theme.colors.primaryEco} />
    </Pressable>
  );
}

/**
 * Flèches du carrousel d'évènements : gauche seulement après le premier, droite seulement avant
 * le dernier. Des emplacements vides gardent la flèche restante à sa place.
 */
export function ProfileEventsCarouselNav({
  index,
  total,
  onPrevious,
  onNext,
}: ProfileEventsCarouselNavProps): React.JSX.Element | null {
  const styles = useStyles(createStyles);

  if (total <= 1) return null;

  return (
    <View style={styles.row}>
      {index > 0 ? (
        <Arrow icon="chevron-left" label="Évènement précédent" onPress={onPrevious} />
      ) : (
        <View style={styles.slot} />
      )}
      <AppText style={styles.counter}>{`${String(index + 1)} / ${String(total)}`}</AppText>
      {index < total - 1 ? (
        <Arrow icon="chevron-right" label="Évènement suivant" onPress={onNext} />
      ) : (
        <View style={styles.slot} />
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    slot: {
      width: 36,
      height: 36,
    },
    arrow: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.white,
      ...theme.shadows.card,
    },
    counter: {
      minWidth: 36,
      textAlign: 'center',
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
  });
