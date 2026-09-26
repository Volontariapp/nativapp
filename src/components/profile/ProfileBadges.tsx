import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { Badge, resolveBadgeVariant } from '@/components/dataDisplay/badge';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { BadgeWeb } from '@volontariapp/contracts';

export interface ProfileBadgesProps {
  badges?: (BadgeWeb | string)[];
}

const DEMO_BADGES: (BadgeWeb | string)[] = [
//   'EVENT_PARTICIPATION_TIER_4',
//   'EVENT_HYBRID_ECO_SOCIAL_TIER_1',
//   'EVENT_SOCIAL_TIER_2',
//   'SOCIAL_LIKE_COUNT_10',
//   'EVENT_HOST_COUNT_1',
];

/**
 * Liste horizontale des badges de l'utilisateur sur son profil.
 * Détecte automatiquement les variantes techniques et permet le clic pour afficher les détails.
 */
export const ProfileBadges = ({ badges }: ProfileBadgesProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const badgesList = badges != null && badges.length > 0 ? badges : DEMO_BADGES;

  const renderItem = useCallback(
    ({ item }: { item: BadgeWeb | string }) => {
      const variant = resolveBadgeVariant(item);

      if (variant != null) {
        return (
          <View style={styles.badgeItemContainer}>
            <Badge variant={variant} showLabel size="md" />
          </View>
        );
      }

      const legacyItem = typeof item === 'object' ? item : null;
      const legacyName = legacyItem?.name ?? (typeof item === 'string' ? item : 'Badge');
      const iconPath = legacyItem?.iconPath;

      return (
        <View style={styles.badgeItemContainer}>
          <View style={styles.fallbackWrapper}>
            {typeof iconPath === 'string' && iconPath !== '' ? (
              <Image source={{ uri: iconPath }} style={styles.fallbackImage} contentFit="contain" />
            ) : (
              <AppIcons icon="award" iconLibrary="Feather" size={26} color={theme.colors.grey} />
            )}
          </View>
          <AppText style={styles.fallbackName} numberOfLines={1}>
            {legacyName}
          </AppText>
        </View>
      );
    },
    [styles, theme.colors.grey],
  );

  const keyExtractor = useCallback(
    (item: BadgeWeb | string, index: number) => {
      const indexStr = String(index);
      if (typeof item === 'string') return `${item}-${indexStr}`;
      const obj = item as { id?: string; slug?: string; name?: string };
      return obj.id ?? obj.slug ?? obj.name ?? `badge-${indexStr}`;
    },
    [],
  );

  if (badgesList.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <AppIcons icon="award" iconLibrary="Feather" size={26} color={theme.colors.grey} />
        <AppText style={styles.emptyText}>Aucun badge pour le moment.</AppText>
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.badgesRow}
      contentContainerStyle={styles.listContent}
      data={badgesList}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    badgesRow: {
      flexDirection: 'row',
      marginTop: theme.spacing.xs,
    },
    listContent: {
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    badgeItemContainer: {
      alignItems: 'center',
      minWidth: 64,
      maxWidth: 80,
    },
    fallbackWrapper: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: theme.colors.white,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: theme.colors.lightGrey,
      ...theme.shadows.card,
      marginBottom: theme.spacing.xs,
    },
    fallbackImage: {
      width: 32,
      height: 32,
    },
    fallbackName: {
      fontSize: 11,
      color: theme.colors.text,
      textAlign: 'center',
      maxWidth: 72,
    },
    emptyCard: {
      backgroundColor: theme.colors.white,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      ...theme.shadows.card,
    },
    emptyText: {
      color: theme.colors.grey,
      fontSize: theme.typography.fontSize.sm,
      textAlign: 'center',
    },
  });
