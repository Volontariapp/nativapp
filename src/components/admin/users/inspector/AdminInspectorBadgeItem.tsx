import React from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { Badge, resolveBadgeVariant } from '@/components/dataDisplay/badge';
import type { BadgeWeb } from '@volontariapp/contracts';

interface AdminInspectorBadgeItemProps {
  badge: BadgeWeb;
  onRemove?: (badgeId: string) => void;
  removeLoading?: boolean;
}

export const AdminInspectorBadgeItem = ({
  badge,
  onRemove,
  removeLoading = false,
}: AdminInspectorBadgeItemProps) => {
  const variant = resolveBadgeVariant(badge);

  const handleRemove = () => {
    Alert.alert(
      'Retirer le badge',
      `Voulez-vous vraiment retirer le badge "${badge.name}" de cet utilisateur ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => onRemove?.(badge.id),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.badgeThumbnail}>
        {variant != null ? (
          <Badge variant={variant} size="sm" disableModal />
        ) : (
          <View style={styles.fallbackIcon}>
            <AppIcons icon="award" iconLibrary="Feather" size={22} color={theme.colors.primaryEco} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <AppText style={styles.nameText} numberOfLines={1}>
            {badge.name}
          </AppText>
          <View style={styles.slugBadge}>
            <AppText style={styles.slugText} numberOfLines={1}>
              {badge.slug}
            </AppText>
          </View>
        </View>
        {typeof badge.description === 'string' && badge.description !== '' ? (
          <AppText style={styles.descText} numberOfLines={2}>
            {badge.description}
          </AppText>
        ) : null}
      </View>

      {onRemove && (
        <Pressable
          onPress={handleRemove}
          disabled={removeLoading}
          style={({ pressed }) => [
            styles.removeBtn,
            { opacity: pressed || removeLoading ? 0.6 : 1 },
          ]}
          hitSlop={8}
        >
          {removeLoading ? (
            <ActivityIndicator size="small" color={theme.colors.danger} />
          ) : (
            <AppIcons icon="trash-2" iconLibrary="Feather" size={16} color={theme.colors.danger} />
          )}
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.lightGrey + '40',
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  badgeThumbnail: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  nameText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
  },
  slugBadge: {
    backgroundColor: theme.colors.lightGrey,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  slugText: {
    fontSize: 10,
    color: theme.colors.grey,
    fontWeight: '500',
  },
  descText: {
    fontSize: 11,
    color: theme.colors.grey,
    marginTop: 2,
  },
  removeBtn: {
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.danger + '15',
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
