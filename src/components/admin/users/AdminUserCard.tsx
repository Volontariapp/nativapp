import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import type { UserWeb } from '@volontariapp/contracts';
import { UserRoles } from '@volontariapp/shared';

export const AdminUserCard = ({
  user,
  onInspect,
  onEdit,
  onDelete,
}: {
  user: UserWeb;
  onInspect: (user: UserWeb) => void;
  onEdit: (user: UserWeb) => void;
  onDelete: (user: UserWeb) => void;
}) => {
  const role = user.role;
  const isAdmin =
    role === (UserRoles.ADMIN as string) ||
    (user.email || '').toLowerCase().includes('admin') ||
    (user.pseudo || '').toLowerCase().includes('admin');
  const isOrg = user.organisationInfo != null || role === (UserRoles.ORGANIZATION as string);
  const roleLabel = isAdmin ? 'Admin' : isOrg ? 'Orga' : 'Bénévole';
  const roleColor = isAdmin
    ? theme.colors.danger
    : isOrg
      ? theme.colors.primarySocio
      : theme.colors.primaryEco;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => {
        onInspect(user);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <AppText style={styles.pseudoText} numberOfLines={1}>
            {user.pseudo || 'Sans pseudo'}
          </AppText>
          <AppText style={styles.emailSubText} numberOfLines={1}>
            {user.email}
          </AppText>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            hitSlop={8}
            onPress={() => {
              onEdit(user);
            }}
            style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.5 : 1 }]}
          >
            <AppIcons icon="edit-2" iconLibrary="Feather" size={18} color={theme.colors.grey} />
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => {
              onDelete(user);
            }}
            style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.5 : 1 }]}
          >
            <AppIcons icon="trash-2" iconLibrary="Feather" size={20} color={theme.colors.danger} />
          </Pressable>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View
          style={[styles.roleBadge, { backgroundColor: roleColor + '15', borderColor: roleColor }]}
        >
          <AppText style={[styles.roleText, { color: roleColor }]}>{roleLabel}</AppText>
        </View>

        <View style={styles.scoreBadge}>
          <AppIcons icon="star" iconLibrary="Feather" size={12} color={theme.colors.primaryEco} />
          <AppText style={styles.scoreText}>{user.totalImpactScore} pts</AppText>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    minWidth: 280,
    flex: 1,
    maxWidth: 400,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cardTitleContainer: {
    flex: 1,
  },
  pseudoText: {
    fontWeight: '600',
    color: theme.colors.black,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: 2,
  },
  emailSubText: {
    fontSize: 11,
    color: theme.colors.grey,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionButton: {
    padding: 6,
    backgroundColor: theme.colors.lightGrey,
    borderRadius: theme.radius.full,
  },
  deleteButton: {
    padding: 6,
    backgroundColor: theme.colors.danger + '15',
    borderRadius: theme.radius.full,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  roleBadge: {
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.lightGrey,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.black,
  },
});
