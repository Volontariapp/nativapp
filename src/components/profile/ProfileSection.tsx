import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Conteneur générique pour une section de la page Profil.
 * Affiche un titre en gris en haut et le contenu en dessous.
 */
export const ProfileSection = ({ title, children }: ProfileSectionProps): React.JSX.Element => {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.section}>
      <AppText style={styles.label}>{title}</AppText>
      {children}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.xl,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.grey,
      textTransform: 'uppercase',
      marginBottom: theme.spacing.sm,
      letterSpacing: 1,
    },
  });
