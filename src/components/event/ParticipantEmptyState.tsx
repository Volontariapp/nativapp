import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

export interface ParticipantEmptyStateProps {
  isSearchActive?: boolean;
  style?: ViewStyle;
}

export function ParticipantEmptyState({
  isSearchActive = false,
  style,
}: ParticipantEmptyStateProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <View style={[styles.container, style]} testID="participant-empty-state">
      <View style={styles.iconCircle}>
        <Feather
          name={isSearchActive ? 'user-x' : 'users'}
          size={28}
          color={theme.colors.grey}
        />
      </View>

      <AppText style={styles.title}>
        {isSearchActive
          ? 'Aucun participant trouvé'
          : 'Aucun bénévole inscrit'}
      </AppText>

      <AppText style={styles.subtitle}>
        {isSearchActive
          ? 'Essayez de modifier votre recherche ou vos filtres.'
          : "Partagez votre événement pour inciter les bénévoles à s'inscrire !"}
      </AppText>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
    },
    iconCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.black,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.grey,
      textAlign: 'center',
      maxWidth: 280,
      lineHeight: 20,
    },
  });
