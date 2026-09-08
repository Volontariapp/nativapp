import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface ProfileHeaderProps {
  pseudo: string;
  avatarUrl?: string;
}

/**
 * En-tête de la page Profil avec la photo (ou un placeholder) et le pseudo.
 */
export const ProfileHeader = ({ pseudo, avatarUrl }: ProfileHeaderProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  return (
    <View style={styles.headerSection}>
      <View style={styles.avatarContainer}>
        {typeof avatarUrl === 'string' && avatarUrl !== '' ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Icon name="user" size={60} color={theme.colors.grey} />
          </View>
        )}
      </View>
      <AppText style={styles.userName}>{pseudo}</AppText>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    headerSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      marginTop: theme.spacing.sm,
    },
    avatarContainer: {
      marginBottom: theme.spacing.md,
    },
    avatarPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.lightGrey,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: theme.colors.white,
      ...theme.shadows.card,
    },
    avatarImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.lightGrey,
      borderWidth: 4,
      borderColor: theme.colors.white,
      ...theme.shadows.card,
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
  });
