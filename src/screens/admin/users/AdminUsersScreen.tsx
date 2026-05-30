import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserApi } from '@/api/admin/admin.user.api';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AdminDataTable } from '@/components/admin/ui/AdminDataTable';
import { FilterChip } from '@/components/ui/FilterChip';
import { SearchBar } from '@/components/ui/SearchBar';
import { getAdminUsersColumns } from '@/components/admin/users/admin-users.columns';
import { AdminUserFormModal } from '@/components/admin/users/AdminUserFormModal';
import { AdminUserEditModal } from '@/components/admin/users/AdminUserEditModal';
import type {
  ListUsersWebResponse,
  UserWeb,
  SignUpRequest,
  UpdateUserRequest,
} from '@volontariapp/contracts';
import { UserRoles } from '@volontariapp/shared';

export default function AdminUsersScreen(): React.JSX.Element {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWeb | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRoles>('ALL');

  const { data, isLoading } = useQuery<ListUsersWebResponse>({
    queryKey: ['admin', 'users'],
    queryFn: async () => await adminUserApi.listUsers({ pagination: { page: 1, limit: 200 } }),
  });

  const createUserMutation = useMutation({
    mutationFn: async (payload: SignUpRequest) => await adminUserApi.signUp(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'count'] });
      setModalVisible(false);
      Alert.alert('Succès', 'Utilisateur créé avec succès !');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || "Impossible de créer l'utilisateur");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, payload }: { userId: string; payload: UpdateUserRequest }) =>
      await adminUserApi.updateUser(payload, { id: userId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setEditModalVisible(false);
      setEditingUser(null);
      Alert.alert('Succès', 'Utilisateur modifié avec succès !');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || "Impossible de modifier l'utilisateur");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await adminUserApi.deleteUser({ id: userId });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'count'] });
      Alert.alert('Succès', 'Utilisateur supprimé.');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || "Impossible de supprimer l'utilisateur");
    },
  });

  const handleCreateUser = (payload: SignUpRequest): void => {
    createUserMutation.mutate(payload);
  };

  const handleUpdateUser = (userId: string, payload: UpdateUserRequest): void => {
    updateUserMutation.mutate({ userId, payload });
  };

  const handleEditPress = (user: UserWeb): void => {
    setEditingUser(user);
    setEditModalVisible(true);
  };

  const handleDeletePress = (user: UserWeb): void => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer l'utilisateur "${user.pseudo || ''}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteUserMutation.mutate(user.id);
          },
        },
      ],
    );
  };

  const usersList = useMemo((): UserWeb[] => {
    if (data == null) return [];
    const unknownData = data as unknown;
    if (Array.isArray(unknownData)) return unknownData as UserWeb[];
    const obj = unknownData as Record<string, unknown>;
    if (Array.isArray(obj.users)) return obj.users as UserWeb[];
    if (Array.isArray(obj.data)) return obj.data as UserWeb[];
    if (Array.isArray(obj.items)) return obj.items as UserWeb[];
    return [];
  }, [data]);

  const filteredUsers = useMemo((): UserWeb[] => {
    return usersList.filter((user: UserWeb): boolean => {
      const email = user.email || '';
      const pseudo = user.pseudo || '';
      const matchesSearch =
        pseudo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase());

      const userRole = user.role;
      const isAdmin =
        userRole === (UserRoles.ADMIN as string) ||
        email.toLowerCase().includes('admin') ||
        pseudo.toLowerCase().includes('admin');

      const matchesRole =
        roleFilter === 'ALL' ||
        (roleFilter === UserRoles.VOLUNTEER &&
          userRole === (UserRoles.VOLUNTEER as string) &&
          !isAdmin) ||
        (roleFilter === UserRoles.ORGANIZATION &&
          (user.organisationInfo != null || userRole === (UserRoles.ORGANIZATION as string))) ||
        (roleFilter === UserRoles.ADMIN && isAdmin);

      return matchesSearch && matchesRole;
    });
  }, [usersList, searchQuery, roleFilter]);

  const columns = useMemo(
    () => getAdminUsersColumns({ onEdit: handleEditPress, onDelete: handleDeletePress }),
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <AppText style={styles.headerTitle}>Utilisateurs</AppText>
          <AppText style={styles.headerSubtitle}>Gestion de tous les comptes enregistrés</AppText>
        </View>
        <AppButton
          text="Nouveau"
          variant="eco"
          icon="plus"
          onPress={() => {
            setModalVisible(true);
          }}
        />
      </View>

      <View style={styles.searchFiltersContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher par pseudo ou email..."
        />
        <View style={styles.filterChipsRow}>
          <FilterChip
            label="Tous"
            selected={roleFilter === 'ALL'}
            color={theme.colors.grey}
            onPress={() => {
              setRoleFilter('ALL');
            }}
          />
          <FilterChip
            label="Bénévoles"
            selected={roleFilter === UserRoles.VOLUNTEER}
            color={theme.colors.primaryEco}
            onPress={() => {
              setRoleFilter(UserRoles.VOLUNTEER);
            }}
          />
          <FilterChip
            label="Organisations"
            selected={roleFilter === UserRoles.ORGANIZATION}
            color={theme.colors.primarySocio}
            onPress={() => {
              setRoleFilter(UserRoles.ORGANIZATION);
            }}
          />
          <FilterChip
            label="Admins"
            selected={roleFilter === UserRoles.ADMIN}
            color={theme.colors.danger}
            onPress={() => {
              setRoleFilter(UserRoles.ADMIN);
            }}
          />
        </View>
      </View>

      <View style={styles.tableContainer}>
        <AdminDataTable<UserWeb>
          data={filteredUsers}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
        />
      </View>

      <AdminUserFormModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
        onSubmit={handleCreateUser}
        isLoading={createUserMutation.isPending}
      />

      <AdminUserEditModal
        visible={editModalVisible}
        user={editingUser}
        onClose={() => {
          setEditModalVisible(false);
        }}
        onSubmit={handleUpdateUser}
        isLoading={updateUserMutation.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.black,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.grey,
    marginTop: theme.spacing.xs,
  },
  tableContainer: { flex: 1, padding: theme.spacing.md },
  searchFiltersContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
