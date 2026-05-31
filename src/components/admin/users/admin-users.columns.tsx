import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import type { UserWeb } from '@volontariapp/contracts';
import { UserRoles } from '@volontariapp/shared';

interface AdminUsersColumnsProps {
  onEdit: (user: UserWeb) => void;
  onDelete: (user: UserWeb) => void;
}

export const getAdminUsersColumns = ({ onEdit, onDelete }: AdminUsersColumnsProps) => [
  {
    key: 'pseudo',
    title: 'Pseudo',
    width: 280,
    render: (item: UserWeb): React.ReactNode => (
      <View>
        <AppText style={styles.pseudoText} numberOfLines={1}>
          {item.pseudo}
        </AppText>
        <AppText style={styles.emailSubText} numberOfLines={1}>
          {item.email}
        </AppText>
      </View>
    ),
  },
  {
    key: 'role',
    title: 'Rôle',
    width: 200,
    render: (item: UserWeb): React.ReactNode => {
      const role = item.role;
      const isAdmin =
        role === (UserRoles.ADMIN as string) ||
        item.email.toLowerCase().includes('admin') ||
        (item.pseudo || '').toLowerCase().includes('admin');
      const isOrg = item.organisationInfo != null || role === (UserRoles.ORGANIZATION as string);
      const roleLabel = isAdmin ? 'Admin' : isOrg ? 'Orga' : 'Bénévole';
      const roleColor = isAdmin
        ? theme.colors.danger
        : isOrg
          ? theme.colors.primarySocio
          : theme.colors.primaryEco;

      return (
        <View style={[styles.roleBadge, { borderColor: roleColor }]}>
          <AppText style={[styles.roleText, { color: roleColor }]}>{roleLabel}</AppText>
        </View>
      );
    },
  },
  {
    key: 'totalImpactScore',
    title: 'Impact',
    width: 120,
    render: (item: UserWeb): React.ReactNode => (
      <AppText style={styles.scoreText}>{item.totalImpactScore} pts</AppText>
    ),
  },
  {
    key: 'actions',
    title: 'Action',
    width: 200,
    render: (item: UserWeb): React.ReactNode => (
      <View style={styles.actionsRow}>
        <Pressable
          onPress={(): void => {
            onEdit(item);
          }}
          style={({ pressed }: { pressed: boolean }) => [
            styles.actionIconButton,
            { backgroundColor: theme.colors.primaryEco + '15', opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <AppIcons icon="edit-2" iconLibrary="Feather" size={16} color={theme.colors.primaryEco} />
        </Pressable>
        <Pressable
          onPress={(): void => {
            onDelete(item);
          }}
          style={({ pressed }: { pressed: boolean }) => [
            styles.actionIconButton,
            { backgroundColor: theme.colors.danger + '15', opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <AppIcons icon="trash-2" iconLibrary="Feather" size={16} color={theme.colors.danger} />
        </Pressable>
      </View>
    ),
  },
];

const styles = StyleSheet.create({
  pseudoText: {
    fontWeight: '600',
    color: theme.colors.black,
    fontSize: theme.typography.fontSize.sm,
  },
  emailSubText: {
    fontSize: 11,
    color: theme.colors.grey,
    marginTop: 2,
  },
  roleBadge: {
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scoreText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  actionIconButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
