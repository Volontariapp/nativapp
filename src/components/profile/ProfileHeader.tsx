import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

interface ProfileHeaderProps {
  pseudo: string;
  avatarUrl?: string;
}

/**
 * En-tête de la page Profil avec la photo (placeholder) et le pseudo.
 */
export const ProfileHeader = ({ pseudo }: ProfileHeaderProps): React.JSX.Element => {
  return (
    <View style={styles.headerSection}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Icon name="user" size={60} color={theme.colors.grey} />
        </View>
      </View>
      <AppText style={styles.userName}>{pseudo}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
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
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.black,
    textAlign: 'center',
  },
});
