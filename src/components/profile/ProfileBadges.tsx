import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
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
  const renderItem = useCallback(({ item }: { item: BadgeWeb }) => (
    <View style={styles.badgeContainer}>
      <View style={styles.badgeImageWrapper}>
        {typeof item.iconPath === 'string' && item.iconPath !== '' ? (
          <Image source={{ uri: item.iconPath }} style={styles.badgeImage} contentFit="contain" />
        ) : (
          <Icon name="award" size={30} color={theme.colors.lightGrey} />
        )}
      </View>
      <AppText style={styles.badgeName} numberOfLines={1}>
        {item.name}
      </AppText>
    </View>
  ), []);

  if (badges.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <AppText style={styles.emptyText}>Aucun badge pour le moment.</AppText>
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.badgesRow}
      data={badges}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
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
