import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import type { BadgeWeb } from '@volontariapp/contracts';

interface ProfileBadgesProps {
  badges: BadgeWeb[];
}

/**
 * Liste horizontale des badges de l'utilisateur.
 */
export const ProfileBadges = ({ badges }: ProfileBadgesProps): React.JSX.Element => {
  if (badges.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <AppText style={styles.emptyText}>Aucun badge pour le moment.</AppText>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesRow}>
      {badges.map((badge) => (
        <View key={badge.id} style={styles.badgeContainer}>
          <View style={styles.badgeImageWrapper}>
            {typeof badge.iconPath === 'string' && badge.iconPath !== '' ? (
              <Image
                source={{ uri: badge.iconPath }}
                style={styles.badgeImage}
                contentFit="contain"
              />
            ) : (
              <Icon name="award" size={30} color={theme.colors.lightGrey} />
            )}
          </View>
          <AppText style={styles.badgeName} numberOfLines={1}>
            {badge.name}
          </AppText>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  badgesRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
  },
  badgeContainer: {
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    width: 70,
  },
  badgeImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    ...theme.shadows.card,
    marginBottom: theme.spacing.xs,
  },
  badgeImage: {
    width: 40,
    height: 40,
  },
  badgeName: {
    fontSize: 10,
    color: theme.colors.black,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.grey,
    fontSize: theme.typography.fontSize.sm,
  },
});
