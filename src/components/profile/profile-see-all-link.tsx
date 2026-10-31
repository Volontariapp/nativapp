import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface ProfileSeeAllLinkProps {
  onPress: () => void;
  accessibilityLabel: string;
}

/** Lien discret « Tout voir » avec chevron, à placer dans l'action d'une ProfileSection. */
export const ProfileSeeAllLink = ({
  onPress,
  accessibilityLabel,
}: ProfileSeeAllLinkProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={theme.spacing.sm}
      style={styles.link}
    >
      <AppText style={styles.text}>Tout voir</AppText>
      <AppIcons
        icon="chevron-right"
        iconLibrary="Feather"
        size={16}
        color={theme.colors.primaryEco}
      />
    </Pressable>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    link: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    text: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primaryEco,
    },
  });
