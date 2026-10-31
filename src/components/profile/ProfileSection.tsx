import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface ProfileSectionProps {
  title: string;
  /** Contrôle aligné à droite sur la ligne du titre (bouton rond, lien « Tout voir »...). */
  action?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Conteneur générique pour une section de la page Profil.
 * Affiche un titre en gris en haut (avec une action optionnelle à droite) et le contenu dessous.
 */
export const ProfileSection = ({
  title,
  action,
  children,
}: ProfileSectionProps): React.JSX.Element => {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <AppText style={styles.label}>{title}</AppText>
        {action}
      </View>
      {children}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.xl,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.grey,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
  });
