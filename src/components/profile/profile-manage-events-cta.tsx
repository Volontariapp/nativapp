import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface ProfileManageEventsCtaProps {
  onPress: () => void;
}

const TITLE = 'Gérer mes évènements';
const ICON_SIZE = 22;
const CHEVRON_SIZE = 20;

/** Raccourci du profil vers la page de gestion des évènements. */
export function ProfileManageEventsCta({
  onPress,
}: ProfileManageEventsCtaProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={TITLE}
      onPress={onPress}
    >
      <View style={styles.iconTile}>
        <Feather name="calendar" size={ICON_SIZE} color={theme.colors.primaryEco} />
      </View>
      <View style={styles.texts}>
        <AppText style={styles.title}>{TITLE}</AppText>
        <AppText style={styles.subtitle}>Participations, wishlist et évènements créés</AppText>
      </View>
      <Feather name="chevron-right" size={CHEVRON_SIZE} color={theme.colors.grey} />
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      marginBottom: theme.spacing.xl,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.white,
      ...theme.shadows.card,
    },
    cardPressed: {
      opacity: 0.85,
    },
    iconTile: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.badgeEcoBackground,
    },
    texts: {
      flex: 1,
    },
    title: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
    },
    subtitle: {
      marginTop: theme.spacing.xs / 2,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.grey,
    },
  });
