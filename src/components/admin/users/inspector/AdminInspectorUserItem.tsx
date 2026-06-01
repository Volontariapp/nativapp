import React from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { adminUserApi } from '@/api/admin/admin.user.api';

import type { UserWeb } from '@volontariapp/contracts';

interface AdminInspectorUserItemProps {
  userId: string;
  onRemove?: (userId: string) => void;
  onPress?: (user: UserWeb) => void;
  removeLoading?: boolean;
}

export const AdminInspectorUserItem = ({
  userId,
  onRemove,
  onPress,
  removeLoading = false,
}: AdminInspectorUserItemProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => adminUserApi.getUser({ id: userId }),
    enabled: !!userId && userId !== 'null',
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.primarySocio} />
      </View>
    );
  }

  const user = data?.user;

  if (!user) {
    return (
      <View style={styles.container}>
        <AppText style={styles.errorText}>Utilisateur introuvable</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.info} onPress={() => onPress?.(user)}>
        <AppText style={styles.pseudoText} numberOfLines={1}>
          {user.pseudo}
        </AppText>
        <AppText style={styles.emailText} numberOfLines={1}>
          {user.email}
        </AppText>
      </Pressable>

      {onRemove && (
        <Pressable
          onPress={() => {
            onRemove(userId);
          }}
          disabled={removeLoading}
          style={({ pressed }) => [
            styles.removeBtn,
            { opacity: pressed || removeLoading ? 0.6 : 1 },
          ]}
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
  loadingContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.lightGrey + '40',
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
  },
  info: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  pseudoText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
  },
  emailText: {
    fontSize: 11,
    color: theme.colors.grey,
    marginTop: 2,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.danger,
    fontStyle: 'italic',
  },
  removeBtn: {
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.danger + '15',
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
