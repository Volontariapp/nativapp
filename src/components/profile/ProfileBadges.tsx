import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import {
  Badge,
  BadgeModal,
  resolveBadgeVariant,
  type CustomBadgeDetails,
} from '@/components/dataDisplay/badge';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { BadgeWeb } from '@volontariapp/contracts';

export interface ProfileBadgesProps {
  badges?: (BadgeWeb | string)[];
}

interface BadgeMetadataCandidate {
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  iconPath?: string;
  awardedAt?: string;
  obtainedAt?: string;
  createdAt?: string;
}

function extractBadgeMetadata(item: BadgeWeb | string): {
  description?: string;
  awardedAt?: string;
  iconPath?: string;
  name?: string;
} {
  if (typeof item !== 'object') {
    return {};
  }
  const candidate = item as BadgeMetadataCandidate;
  const description =
    typeof candidate.description === 'string' && candidate.description.trim() !== ''
      ? candidate.description
      : undefined;
  const rawDate = candidate.awardedAt ?? candidate.obtainedAt ?? candidate.createdAt;
  const awardedAt =
    typeof rawDate === 'string' && rawDate.trim() !== '' ? rawDate : undefined;
  const iconPath =
    typeof candidate.iconPath === 'string' && candidate.iconPath.trim() !== ''
      ? candidate.iconPath
      : undefined;
  const name =
    typeof candidate.name === 'string' && candidate.name.trim() !== ''
      ? candidate.name
      : undefined;

  return { description, awardedAt, iconPath, name };
}

/**
 * Liste horizontale des badges de l'utilisateur sur son profil.
 * Détecte automatiquement les variantes techniques et permet le clic pour afficher les détails.
 */
export const ProfileBadges = ({ badges }: ProfileBadgesProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const [selectedCustomBadge, setSelectedCustomBadge] = useState<CustomBadgeDetails | null>(
    null,
  );

  const badgesList = badges != null && badges.length > 0 ? badges : [];

  const renderItem = useCallback(
    ({ item }: { item: BadgeWeb | string }) => {
      const variant = resolveBadgeVariant(item);
      const metadata = extractBadgeMetadata(item);

      if (variant != null) {
        return (
          <View style={styles.badgeItemContainer}>
            <Badge
              variant={variant}
              showLabel
              size="md"
              awardedAt={metadata.awardedAt}
              customDescription={metadata.description}
            />
          </View>
        );
      }

      const legacyName =
        metadata.name ?? (typeof item === 'string' && item.trim() !== '' ? item : 'Badge');
      const iconPath = metadata.iconPath;

      return (
        <Pressable
          style={({ pressed }) => [
            styles.badgeItemContainer,
            pressed && styles.fallbackPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Badge ${legacyName}`}
          accessibilityHint="Appuyer pour afficher les détails de ce badge"
          onPress={() => {
            setSelectedCustomBadge({
              name: legacyName,
              description: metadata.description,
              iconPath,
              awardedAt: metadata.awardedAt,
            });
          }}
        >
          <View style={styles.fallbackWrapper}>
            {typeof iconPath === 'string' && iconPath !== '' ? (
              <Image
                source={{ uri: iconPath }}
                style={styles.fallbackImage}
                contentFit="contain"
              />
            ) : (
              <AppIcons
                icon="award"
                iconLibrary="Feather"
                size={26}
                color={theme.colors.grey}
              />
            )}
          </View>
          <AppText style={styles.fallbackName} numberOfLines={1}>
            {legacyName}
          </AppText>
        </Pressable>
      );
    },
    [styles, theme.colors.grey],
  );

  const keyExtractor = useCallback((item: BadgeWeb | string, index: number) => {
    const indexStr = String(index);
    if (typeof item === 'string') return `${item}-${indexStr}`;
    const obj = item as { id?: string; slug?: string; name?: string };
    return obj.id ?? obj.slug ?? obj.name ?? `badge-${indexStr}`;
  }, []);

  if (badgesList.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <AppIcons icon="award" iconLibrary="Feather" size={26} color={theme.colors.grey} />
        <AppText style={styles.emptyText}>Aucun badge pour le moment.</AppText>
      </View>
    );
  }

  return (
    <>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.badgesRow}
        contentContainerStyle={styles.listContent}
        data={badgesList}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />

      <BadgeModal
        visible={selectedCustomBadge !== null}
        variant={null}
        customBadge={selectedCustomBadge}
        onClose={() => {
          setSelectedCustomBadge(null);
        }}
      />
    </>
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
    fallbackPressed: {
      opacity: 0.75,
      transform: [{ scale: 0.96 }],
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
