import React, { useReducer, useMemo, useCallback } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, FlatList } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { FilterChip, SearchBar } from '@/components/ui';
import {
  AdminUserFormModal,
  AdminUserEditModal,
  AdminUserCard,
  AdminUserInspectorModal,
} from '@/components/admin/users';
import type { UserWeb, SignUpRequest, UpdateUserRequest } from '@volontariapp/contracts';
import { UserRoles } from '@volontariapp/shared';
import {
  useAdminUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  normalizeUsersList,
} from '@/api/admin/hooks/use-admin-users';

interface AdminUsersState {
  modalVisible: boolean;
  editModalVisible: boolean;
  inspectModalVisible: boolean;
  editingUser: UserWeb | null;
  inspectingUser: UserWeb | null;
  searchQuery: string;
  roleFilter: 'ALL' | UserRoles;
}

export default function AdminUsersScreen(): React.JSX.Element {
  const [state, setState] = useReducer(
    (s: AdminUsersState, a: Partial<AdminUsersState>) => ({ ...s, ...a }),
    {
      modalVisible: false,
      editModalVisible: false,
      inspectModalVisible: false,
      editingUser: null,
      inspectingUser: null,
      searchQuery: '',
      roleFilter: 'ALL',
    },
  );

  const { data, isLoading } = useAdminUsersQuery();

  const createUserMutation = useCreateUserMutation(() => {
    setState({ modalVisible: false });
  });

  const updateUserMutation = useUpdateUserMutation(() => {
    setState({ editModalVisible: false, editingUser: null });
  });

  const deleteUserMutation = useDeleteUserMutation();

  const handleCreateUser = useCallback(
    (payload: SignUpRequest): void => {
      createUserMutation.mutate(payload);
    },
    [createUserMutation],
  );

  const handleUpdateUser = useCallback(
    (userId: string, payload: UpdateUserRequest): void => {
      updateUserMutation.mutate({ userId, payload });
    },
    [updateUserMutation],
  );

  const handleEditPress = useCallback((user: UserWeb): void => {
    setState({ editingUser: user, editModalVisible: true });
  }, []);

  const handleInspectPress = useCallback((user: UserWeb): void => {
    setState({ inspectingUser: user, inspectModalVisible: true });
  }, []);

  const handleDeletePress = useCallback(
    (user: UserWeb): void => {
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
    },
    [deleteUserMutation],
  );

  const usersList = useMemo((): UserWeb[] => normalizeUsersList(data), [data]);

  const filteredUsers = useMemo((): UserWeb[] => {
    return usersList.filter((user: UserWeb): boolean => {
      const email = user.email || '';
      const pseudo = user.pseudo || '';
      const matchesSearch =
        pseudo.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(state.searchQuery.toLowerCase());

      const userRole = user.role;
      const isAdmin =
        userRole === (UserRoles.ADMIN as string) ||
        email.toLowerCase().includes('admin') ||
        pseudo.toLowerCase().includes('admin');

      const matchesRole =
        state.roleFilter === 'ALL' ||
        (state.roleFilter === UserRoles.VOLUNTEER &&
          userRole === (UserRoles.VOLUNTEER as string) &&
          !isAdmin) ||
        (state.roleFilter === UserRoles.ORGANIZATION &&
          (user.organisationInfo != null || userRole === (UserRoles.ORGANIZATION as string))) ||
        (state.roleFilter === UserRoles.ADMIN && isAdmin);

      return matchesSearch && matchesRole;
    });
  }, [usersList, state.searchQuery, state.roleFilter]);

  const renderItem = useCallback(
    ({ item }: { item: UserWeb }) => (
      <AdminUserCard
        user={item}
        onInspect={handleInspectPress}
        onEdit={handleEditPress}
        onDelete={handleDeletePress}
      />
    ),
    [handleInspectPress, handleEditPress, handleDeletePress],
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
            setState({ modalVisible: true });
          }}
        />
      </View>

      <View style={styles.searchFiltersContainer}>
        <SearchBar
          value={state.searchQuery}
          onChangeText={(v) => {
            setState({ searchQuery: v });
          }}
          placeholder="Rechercher par pseudo ou email..."
        />
        <View style={styles.filterChipsRow}>
          <FilterChip
            label="Tous"
            selected={state.roleFilter === 'ALL'}
            color={theme.colors.grey}
            onPress={() => {
              setState({ roleFilter: 'ALL' });
            }}
          />
          <FilterChip
            label="Bénévoles"
            selected={state.roleFilter === UserRoles.VOLUNTEER}
            color={theme.colors.primaryEco}
            onPress={() => {
              setState({ roleFilter: UserRoles.VOLUNTEER });
            }}
          />
          <FilterChip
            label="Organisations"
            selected={state.roleFilter === UserRoles.ORGANIZATION}
            color={theme.colors.primarySocio}
            onPress={() => {
              setState({ roleFilter: UserRoles.ORGANIZATION });
            }}
          />
          <FilterChip
            label="Admins"
            selected={state.roleFilter === UserRoles.ADMIN}
            color={theme.colors.danger}
            onPress={() => {
              setState({ roleFilter: UserRoles.ADMIN });
            }}
          />
        </View>
      </View>

      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primarySocio} />
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.cardsContainer}
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        )}
      </View>

      <AdminUserFormModal
        visible={state.modalVisible}
        onClose={() => {
          setState({ modalVisible: false });
        }}
        onSubmit={handleCreateUser}
        isLoading={createUserMutation.isPending}
      />

      <AdminUserEditModal
        visible={state.editModalVisible}
        user={state.editingUser}
        onClose={() => {
          setState({ editModalVisible: false });
        }}
        onSubmit={handleUpdateUser}
        isLoading={updateUserMutation.isPending}
      />

      {state.inspectingUser != null && (
        <AdminUserInspectorModal
          visible={state.inspectModalVisible}
          user={state.inspectingUser}
          onClose={() => {
            setState({ inspectModalVisible: false });
          }}
        />
      )}
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
  listContainer: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
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
