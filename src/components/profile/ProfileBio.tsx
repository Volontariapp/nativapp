import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

interface ProfileBioProps {
  bio?: string;
}

/**
 * Section Bio du profil utilisateur.
 */
export const ProfileBio = ({ bio }: ProfileBioProps): React.JSX.Element => {
  return (
    <View style={styles.bioCard}>
      <AppText style={styles.bioText}>
        {typeof bio === 'string' && bio.trim() !== ''
          ? bio
          : "Aucune bio n'a été renseignée pour le moment. Raconte-nous un peu qui tu es !"}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  bioCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    ...theme.shadows.card,
  },
  bioText: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: 22,
    color: theme.colors.black,
  },
});
